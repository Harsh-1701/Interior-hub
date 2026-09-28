
import http from "node:http";
import https from "node:https";
import {URL} from "node:url";
import {randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash} from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const PORT=Number(process.env.PORT||8787);
const NODE_ENV=process.env.NODE_ENV||"development";
const SESSION_TTL_HOURS=Number(process.env.SESSION_TTL_HOURS||168);
const PUBLIC=path.join(__dirname,"public");
const DATA=path.join(__dirname,"data","db.json");
const pg=process.env.DATABASE_URL?(await import("pg")).default:null;
const pool=process.env.DATABASE_URL?new pg.Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_URL.includes("sslmode=require")?{rejectUnauthorized:false}:undefined}):null;
const sessions=new Map();
const otpMemory=new Map();
const rate=new Map();
const sseClients=new Set();

function json(res,status,data){
  const body=JSON.stringify(data);
  res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type,Authorization","Access-Control-Allow-Methods":"GET,POST,PUT,OPTIONS"});
  res.end(body);
}
function text(res,status,body,type="text/plain; charset=utf-8"){res.writeHead(status,{"Content-Type":type,"Cache-Control":"no-store"});res.end(body)}
async function parseBody(req){
  let raw="";let size=0;
  for await (const chunk of req){size+=chunk.length;if(size>6_500_000){throw new Error("Payload too large")}raw+=chunk}
  try{return raw?JSON.parse(raw):{}}catch{throw new Error("Invalid JSON")}
}
function hashPassword(password){return scryptSync(password,SALT,64).toString("hex")}
function verifyPassword(password,hash){try{return timingSafeEqual(Buffer.from(hash,"hex"),scryptSync(password,SALT,64))}catch{return false}}
const SALT=process.env.PASSWORD_SALT||"interiorhub-change-this-in-production";
function hashCode(code){return createHash("sha256").update(code+"|"+SALT).digest("hex")}
function normalizePhone(v){return String(v||"").replace(/[^\d+]/g,"")}
function validEmail(v){return /^\S+@\S+\.\S+$/.test(String(v||""))}
function validPhone(v){return /^\+?[1-9]\d{9,14}$/.test(normalizePhone(v))}
function bearer(req){const h=req.headers.authorization||"";return h.startsWith("Bearer ")?h.slice(7):null}
function parseCookies(req){const raw=req.headers.cookie||"";return Object.fromEntries(raw.split(";").map(x=>x.trim().split("=")).filter(x=>x.length===2).map(([k,v])=>[k,decodeURIComponent(v)]))}
function sessionToken(req){return bearer(req)||parseCookies(req).interiorhub_session||null}
function setSessionCookie(res,token,maxAge){res.setHeader("Set-Cookie",`interiorhub_session=${encodeURIComponent(token)}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax`)}
function clearSessionCookie(res){res.setHeader("Set-Cookie","interiorhub_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax")}
function broadcast(event){const data=`data: ${JSON.stringify(event)}\n\n`;for(const client of sseClients){try{client.res.write(data)}catch{sseClients.delete(client)}}}


async function readFileDb(){
  try{return JSON.parse(await fs.readFile(DATA,"utf8"))}catch{return {users:[],state:null}}
}
async function writeFileDb(db){
  await fs.mkdir(path.dirname(DATA),{recursive:true});
  await fs.writeFile(DATA,JSON.stringify(db,null,2));
}
async function dbInit(){
  if(!pool){
    const db=await readFileDb();
    if(!Array.isArray(db.users)) db.users=[];
    if(!db.users.some(u=>u.email==='aditi@example.com')){
      db.users.push(
        {id:"demo-customer",name:"Aditi",email:"aditi@example.com",phone:"+919876543210",role:"customer",status:"Active",studio:null,passwordHash:hashPassword("demo1234")},
        {id:"demo-designer",name:"Rhea Kapoor",email:"studio@studionest.in",phone:"+919876543211",role:"designer",status:"Active",studio:"Studio Nest",passwordHash:hashPassword("demo1234")},
        {id:"demo-admin",name:"InteriorHub Admin",email:"admin@interiorhub.in",phone:"+919876543212",role:"admin",status:"Active",studio:null,passwordHash:hashPassword("demo1234")}
      );
      await writeFileDb(db);
    }
    return;
  }
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE,phone TEXT UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('customer','designer','admin')),
    status TEXT NOT NULL DEFAULT 'Active',studio TEXT,password_hash TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires_at TIMESTAMPTZ NOT NULL)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS otp_codes (id BIGSERIAL PRIMARY KEY,phone TEXT NOT NULL,purpose TEXT NOT NULL,code_hash TEXT NOT NULL,expires_at TIMESTAMPTZ NOT NULL,attempts INT NOT NULL DEFAULT 0,consumed BOOLEAN NOT NULL DEFAULT FALSE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
  await pool.query(`CREATE INDEX IF NOT EXISTS otp_phone_idx ON otp_codes(phone)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS app_state (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,state JSONB NOT NULL,updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
  await pool.query(`CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY,project_id TEXT NOT NULL,sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,payload JSONB NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
  await pool.query(`CREATE INDEX IF NOT EXISTS messages_project_idx ON messages(project_id,created_at)`);
}

function publicUser(u){return {id:u.id,name:u.name,email:u.email||"",phone:u.phone||"",role:u.role,status:u.status,studio:u.studio||null}}
async function findUserByEmail(email){
  if(pool){const r=await pool.query("SELECT id,name,email,phone,role,status,studio,password_hash AS \"passwordHash\" FROM users WHERE lower(email)=lower($1)",[email]);return r.rows[0]||null}
  const db=await readFileDb();return db.users.find(u=>String(u.email||"").toLowerCase()===email.toLowerCase())||null
}
async function findUserByPhone(phone){
  if(pool){const r=await pool.query("SELECT id,name,email,phone,role,status,studio,password_hash AS \"passwordHash\" FROM users WHERE phone=$1",[phone]);return r.rows[0]||null}
  const db=await readFileDb();return db.users.find(u=>u.phone===phone)||null
}
async function createUser(u){
  if(pool){await pool.query("INSERT INTO users(id,name,email,phone,role,status,studio,password_hash) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",[u.id,u.name,u.email||null,u.phone||null,u.role,u.status,u.studio||null,u.passwordHash||null]);return}
  const db=await readFileDb();db.users.push(u);await writeFileDb(db)
}
async function issueSession(userId){
  const token=randomBytes(32).toString("base64url");
  const expires=new Date(Date.now()+SESSION_TTL_HOURS*3600_000);
  if(pool) await pool.query("INSERT INTO sessions(token,user_id,expires_at) VALUES($1,$2,$3)",[token,userId,expires]);
  else sessions.set(token,{userId,expires});
  return token;
}
async function authUser(req,explicitToken=null){
  const token=explicitToken||sessionToken(req);if(!token)return null;
  if(pool){
    const r=await pool.query(`SELECT u.id,u.name,u.email,u.phone,u.role,u.status,u.studio
      FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=$1 AND s.expires_at>NOW()`,[token]);
    return r.rows[0]||null;
  }
  const s=sessions.get(token);if(!s||s.expires<Date.now()){sessions.delete(token);return null}
  const db=await readFileDb();return db.users.find(u=>u.id===s.userId)||null;
}
async function saveState(state,userId){
  if(pool) await pool.query(`INSERT INTO app_state(user_id,state,updated_at) VALUES($1,$2,NOW()) ON CONFLICT(user_id) DO UPDATE SET state=EXCLUDED.state,updated_at=NOW()`,[userId,JSON.stringify(state)]);
  else {const db=await readFileDb();db.states=db.states||{};db.states[userId]={state,updatedAt:new Date().toISOString()};await writeFileDb(db)}
}
async function loadState(userId){
  if(pool){const r=await pool.query("SELECT state FROM app_state WHERE user_id=$1",[userId]);return r.rows[0]?.state||null}
  const db=await readFileDb();return db.states?.[userId]?.state||null
}

function checkRate(key,limit=3,windowMs=10*60_000){
  const now=Date.now(),arr=(rate.get(key)||[]).filter(t=>now-t<windowMs);
  if(arr.length>=limit)return false;arr.push(now);rate.set(key,arr);return true;
}
async function sendSms(phone,code){
  const sid=process.env.TWILIO_ACCOUNT_SID,token=process.env.TWILIO_AUTH_TOKEN,from=process.env.TWILIO_FROM;
  if(!sid||!token||!from){
    if(NODE_ENV==="production")throw new Error("SMS provider is not configured.");
    console.log(`[InteriorHub DEV OTP] ${phone}: ${code}`);
    return {devOtp:code};
  }
  const body=new URLSearchParams({To:phone,From:from,Body:`Your InteriorHub verification code is ${code}. It expires in 10 minutes. Never share this code.`}).toString();
  const auth=Buffer.from(`${sid}:${token}`).toString("base64");
  return await new Promise((resolve,reject)=>{
    const req=https.request({hostname:"api.twilio.com",path:`/2010-04-01/Accounts/${sid}/Messages.json`,method:"POST",headers:{"Authorization":`Basic ${auth}`,"Content-Type":"application/x-www-form-urlencoded","Content-Length":Buffer.byteLength(body)}},res=>{
      let raw="";res.on("data",c=>raw+=c);res.on("end",()=>res.statusCode>=200&&res.statusCode<300?resolve({}):reject(new Error("SMS provider rejected the request.")));
    });
    req.on("error",reject);req.write(body);req.end();
  });
}
async function storeOtp(phone,purpose,code){
  const expires=new Date(Date.now()+10*60_000),h=hashCode(code);
  if(pool){await pool.query("UPDATE otp_codes SET consumed=true WHERE phone=$1 AND purpose=$2 AND consumed=false",[phone,purpose]);await pool.query("INSERT INTO otp_codes(phone,purpose,code_hash,expires_at) VALUES($1,$2,$3,$4)",[phone,purpose,h,expires])}
  else {otpMemory.set(phone+"|"+purpose,{hash:h,expires:expires.getTime(),attempts:0})}
}
async function consumeOtp(phone,purpose,code){
  if(pool){
    const r=await pool.query("SELECT id,code_hash,expires_at,attempts FROM otp_codes WHERE phone=$1 AND purpose=$2 AND consumed=false ORDER BY id DESC LIMIT 1",[phone,purpose]);
    const row=r.rows[0];if(!row||new Date(row.expires_at)<new Date()||row.attempts>=5)return false;
    if(row.code_hash!==hashCode(code)){await pool.query("UPDATE otp_codes SET attempts=attempts+1 WHERE id=$1",[row.id]);return false}
    await pool.query("UPDATE otp_codes SET consumed=true WHERE id=$1",[row.id]);return true;
  }
  const k=phone+"|"+purpose,row=otpMemory.get(k);if(!row||row.expires<Date.now()||row.attempts>=5)return false;
  if(row.hash!==hashCode(code)){row.attempts++;return false}otpMemory.delete(k);return true;
}

async function route(req,res){
  if(req.url && !req.url.startsWith("/api/events")) console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    if(req.method==="OPTIONS"){res.writeHead(204,{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type,Authorization","Access-Control-Allow-Methods":"GET,POST,PUT,OPTIONS"});return res.end()}
  const u=new URL(req.url,`http://${req.headers.host||"localhost"}`);
  try{
    if(u.pathname==="/api/health")return json(res,200,{ok:true,service:"InteriorHub API",database:!!pool,sms:!!process.env.TWILIO_ACCOUNT_SID});
    if(u.pathname==="/api/auth/signup"&&req.method==="POST"){
      const b=await parseBody(req),email=String(b.email||"").trim().toLowerCase(),role=b.role==="designer"?"designer":"customer";
      if(!b.name||!validEmail(email)||String(b.password||"").length<8)return json(res,400,{error:"Name, valid email and 8+ character password are required."});
      if(await findUserByEmail(email))return json(res,409,{error:"An account with this email already exists."});
      const user={id:randomUUID(),name:String(b.name).trim(),email,phone:validPhone(b.phone)?normalizePhone(b.phone):null,role,status:"Active",studio:role==="designer"?(String(b.studio||"").trim()||`${String(b.name).trim()} Studio`):null,passwordHash:hashPassword(b.password)};
      await createUser(user);const token=await issueSession(user.id);setSessionCookie(res,token,SESSION_TTL_HOURS*3600);return json(res,201,{token,user:publicUser(user)});
    }
    if(u.pathname==="/api/auth/login"&&req.method==="POST"){
      const b=await parseBody(req),email=String(b.email||"").trim().toLowerCase(),user=await findUserByEmail(email);
      if(!user||!verifyPassword(String(b.password||""),user.passwordHash))return json(res,401,{error:"Invalid email or password."});
      if(user.status==="Suspended")return json(res,403,{error:"This account is suspended."});
      const token=await issueSession(user.id);setSessionCookie(res,token,SESSION_TTL_HOURS*3600);return json(res,200,{token,user:publicUser(user)});
    }
    if(u.pathname==="/api/auth/request-otp"&&req.method==="POST"){
      const b=await parseBody(req),phone=normalizePhone(b.phone),purpose=b.purpose==="signup"?"signup":"login";
      if(!validPhone(phone))return json(res,400,{error:"Enter a valid international mobile number."});
      if(!checkRate("otp:"+phone))return json(res,429,{error:"Too many OTP requests. Try again in a few minutes."});
      if(purpose==="login"&&!await findUserByPhone(phone))return json(res,404,{error:"No account is registered with this phone number."});
      const code=String(Math.floor(100000+Math.random()*900000));await storeOtp(phone,purpose,code);const result=await sendSms(phone,code);
      return json(res,200,{ok:true,...result});
    }
    if(u.pathname==="/api/auth/verify-otp"&&req.method==="POST"){
      const b=await parseBody(req),phone=normalizePhone(b.phone),purpose=b.purpose==="signup"?"signup":"login";
      if(!await consumeOtp(phone,purpose,String(b.otp||"")))return json(res,401,{error:"Invalid or expired OTP."});
      let user=await findUserByPhone(phone);
      if(purpose==="signup"){
        if(user)return json(res,409,{error:"A phone account already exists."});
        const role=b.role==="designer"?"designer":"customer";
        user={id:randomUUID(),name:String(b.name||"InteriorHub User").trim(),email:null,phone,role,status:"Active",studio:role==="designer"?(String(b.studio||"").trim()||"Studio"):null,passwordHash:null};
        await createUser(user);
      }else if(!user)return json(res,404,{error:"Account not found."});
      if(user.status==="Suspended")return json(res,403,{error:"This account is suspended."});
      const token=await issueSession(user.id);setSessionCookie(res,token,SESSION_TTL_HOURS*3600);return json(res,200,{token,user:publicUser(user)});
    }
    if(u.pathname==="/api/me"&&req.method==="GET"){
      const user=await authUser(req);if(!user)return json(res,401,{error:"Unauthorized"});return json(res,200,{user:publicUser(user)});
    }
    if(u.pathname==="/api/state"&&req.method==="GET"){
      const user=await authUser(req);if(!user)return json(res,401,{error:"Unauthorized"});return json(res,200,{state:await loadState(user.id)});
    }
    if(u.pathname==="/api/state"&&req.method==="PUT"){
      const user=await authUser(req);if(!user)return json(res,401,{error:"Unauthorized"});
      const b=await parseBody(req);if(!b.state||typeof b.state!=="object")return json(res,400,{error:"State object required"});
      await saveState(b.state,user.id);return json(res,200,{ok:true,savedAt:new Date().toISOString()});
    }
    if(u.pathname==="/api/auth/logout"&&req.method==="POST"){
      const token=sessionToken(req);if(token&&pool)await pool.query("DELETE FROM sessions WHERE token=$1",[token]);else if(token)sessions.delete(token);clearSessionCookie(res);return json(res,200,{ok:true});
    }

    if(u.pathname==="/api/messages"&&req.method==="GET") {
      const user=await authUser(req);if(!user)return json(res,401,{error:"Unauthorized"});
      const projectId=u.searchParams.get("projectId")||"IH-2026-001";
      if(pool){const r=await pool.query("SELECT payload FROM messages WHERE project_id=$1 ORDER BY created_at ASC LIMIT 500",[projectId]);return json(res,200,{messages:r.rows.map(x=>x.payload)});}
      const db=await readFileDb();return json(res,200,{messages:(db.messages||[]).filter(m=>m.projectId===projectId).slice(-500)});
    }
    if(u.pathname==="/api/messages"&&req.method==="POST") {
      const user=await authUser(req);if(!user)return json(res,401,{error:"Unauthorized"});
      const b=await parseBody(req),m=b.message||{};
      if(!m.projectId||(!String(m.text||"").trim()&&!Array.isArray(m.attachments)&&!Array.isArray(m.references)))return json(res,400,{error:"Message content is required."});
      const safe={...m,id:m.id||randomUUID(),from:user.role,text:String(m.text||""),createdAt:m.createdAt||new Date().toISOString(),sender:{id:user.id,name:user.name,role:user.role}};
      if(pool){await pool.query("INSERT INTO messages(id,project_id,sender_id,payload,created_at) VALUES($1,$2,$3,$4,$5) ON CONFLICT(id) DO NOTHING",[safe.id,safe.projectId,user.id,JSON.stringify(safe),new Date(safe.createdAt)]);}
      else {const db=await readFileDb();db.messages=db.messages||[];if(!db.messages.some(x=>x.id===safe.id))db.messages.push(safe);await writeFileDb(db);}
      broadcast({type:"message",message:safe,projectId:safe.projectId});return json(res,201,{message:safe});
    }
    if(u.pathname==="/api/events"&&req.method==="GET") {
      const user=await authUser(req,u.searchParams.get("token"));if(!user)return json(res,401,{error:"Unauthorized"});
      res.writeHead(200,{"Content-Type":"text/event-stream; charset=utf-8","Cache-Control":"no-cache, no-transform","Connection":"keep-alive","X-Accel-Buffering":"no","Access-Control-Allow-Origin":"*"});
      const client={res,userId:user.id};sseClients.add(client);res.write(`data: ${JSON.stringify({type:"ready",at:new Date().toISOString()})}\n\n`);
      const hb=setInterval(()=>{try{res.write(`: heartbeat\n\n`)}catch{clearInterval(hb);sseClients.delete(client)}},25000);
      req.on("close",()=>{clearInterval(hb);sseClients.delete(client)});return;
    }
    // Static frontend
    let file=u.pathname==="/"?"index.html":u.pathname.replace(/^\/+/,"");
    if(file.includes(".."))return text(res,400,"Bad path");
    const full=path.join(PUBLIC,file);
    try{
      const data=await fs.readFile(full);
      const ext=path.extname(full);
      const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".ico":"image/x-icon"};
      res.writeHead(200,{"Content-Type":types[ext]||"application/octet-stream","Cache-Control":ext===".html"?"no-store":"public, max-age=3600"});res.end(data);
    }catch{json(res,404,{error:"Not found"})}
  }catch(e){console.error(e);json(res,500,{error:e.message||"Internal server error"})}
}

await dbInit();
http.createServer(route).listen(PORT,()=>console.log(`InteriorHub running on http://localhost:${PORT}`));
