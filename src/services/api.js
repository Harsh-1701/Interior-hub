// API Client Helper for Interior Hub

const getHeaders = (userId) => {
  const headers = { 'Content-Type': 'application/json' };
  if (userId) {
    headers['x-user-id'] = userId;
  } else {
    try {
      const stored = localStorage.getItem('interior_hub_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u.id) headers['x-user-id'] = u.id;
      }
    } catch (e) {}
  }
  return headers;
};

export const api = {
  // Auth
  async getMe(userId) {
    const res = await fetch(`/api/auth/me${userId ? `?userId=${userId}` : ''}`, { headers: getHeaders(userId) });
    return res.json();
  },
  async getDemoUsers() {
    const res = await fetch('/api/auth/users');
    return res.json();
  },
  async demoLogin(userId) {
    const res = await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    return res.json();
  },
  async login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },
  async register(data) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Designers
  async getDesigners(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`/api/designers${qs ? `?${qs}` : ''}`);
    return res.json();
  },
  async getDesigner(id) {
    const res = await fetch(`/api/designers/${id}`);
    return res.json();
  },
  async addReview(designerId, data) {
    const res = await fetch(`/api/designers/${designerId}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async addPortfolio(designerId, data) {
    const res = await fetch(`/api/designers/${designerId}/portfolio`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Projects
  async getProjects(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`/api/projects${qs ? `?${qs}` : ''}`);
    return res.json();
  },
  async getProject(id) {
    const res = await fetch(`/api/projects/${id}`);
    return res.json();
  },
  async createProject(data) {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateProject(id, data) {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async addMilestone(projectId, data) {
    const res = await fetch(`/api/projects/${projectId}/milestones`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async toggleMilestone(projectId, milestoneId, completed) {
    const res = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ completed })
    });
    return res.json();
  },
  async addDeliverable(projectId, data) {
    const res = await fetch(`/api/projects/${projectId}/deliverables`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Consultations
  async getConsultations(userId, role) {
    const qs = new URLSearchParams({ userId, role }).toString();
    const res = await fetch(`/api/consultations?${qs}`);
    return res.json();
  },
  async bookConsultation(data) {
    const res = await fetch('/api/consultations', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateConsultation(id, status) {
    const res = await fetch(`/api/consultations/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Proposals
  async getProposals(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`/api/proposals?${qs}`);
    return res.json();
  },
  async submitProposal(data) {
    const res = await fetch('/api/proposals', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async acceptProposal(id) {
    const res = await fetch(`/api/proposals/${id}/accept`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return res.json();
  },
  async declineProposal(id) {
    const res = await fetch(`/api/proposals/${id}/decline`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return res.json();
  },

  // Invoices
  async getInvoices(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`/api/invoices?${qs}`);
    return res.json();
  },
  async createInvoice(data) {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async payInvoice(id) {
    const res = await fetch(`/api/invoices/${id}/pay`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return res.json();
  },

  // Moodboards
  async getMoodboards(userId) {
    const qs = userId ? `?userId=${userId}` : '';
    const res = await fetch(`/api/moodboards${qs}`);
    return res.json();
  },
  async createMoodboard(data) {
    const res = await fetch('/api/moodboards', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async addMoodboardItem(boardId, data) {
    const res = await fetch(`/api/moodboards/${boardId}/items`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteMoodboardItem(boardId, itemId) {
    const res = await fetch(`/api/moodboards/${boardId}/items/${itemId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Messages
  async getConversations(userId) {
    const res = await fetch(`/api/messages/conversations${userId ? `?userId=${userId}` : ''}`, {
      headers: getHeaders(userId)
    });
    return res.json();
  },
  async getThread(otherUserId, currentUserId) {
    const res = await fetch(`/api/messages/thread/${otherUserId}${currentUserId ? `?userId=${currentUserId}` : ''}`, {
      headers: getHeaders(currentUserId)
    });
    return res.json();
  },
  async sendMessage(data) {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Gallery
  async getGallery(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`/api/gallery${qs ? `?${qs}` : ''}`);
    return res.json();
  },
  async likeGalleryItem(id, userId) {
    const res = await fetch(`/api/gallery/${id}/like`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

  // Quiz
  async evaluateQuiz(answers) {
    const res = await fetch('/api/quiz/evaluate', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(answers)
    });
    return res.json();
  },

  // Estimator
  async calculateCost(params) {
    const res = await fetch('/api/estimator/calculate', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params)
    });
    return res.json();
  },

  // Upload
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    return res.json();
  }
};
