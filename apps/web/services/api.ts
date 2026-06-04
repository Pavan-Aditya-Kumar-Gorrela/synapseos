const BASE_URL = process.env.API_URL || "http://127.0.0.1:8000/api/v1";

// ─── Generic HTTP Client ───────────────────────────────────

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ══════════════════════════════════════════════════════════
// TYPES  (mirrors backend schemas)
// ══════════════════════════════════════════════════════════

export interface UserRead {
  id: string;
  full_name: string;
  email: string;
  organization_id: string;
  role: string;
  created_at: string;
}

export interface UserUpdate {
  full_name?: string;
  password?: string;
}

export interface OrganizationRead {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  plan: string;
  created_at: string;
}

export interface OrganizationUpdate {
  name?: string;
  slug?: string;
  industry?: string;
}

export interface DocumentListItem {
  id: string;
  organization_id: string;
  uploaded_by: string | null;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface DocumentRead extends DocumentListItem {
  extracted_text: string | null;
  storage_path: string;
}

export interface ChatRead {
  id: string;
  organization_id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface ChatCreate {
  title: string;
}

export interface ChatMessageRead {
  id: string;
  chat_id: string;
  role: string;
  content: string;
  created_at: string;
}

export interface ChatMessageCreate {
  role: string;
  content: string;
}


export interface WorkflowRead {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'archived';
  organization_id: string;
  created_at: string;
}

export interface WorkflowCreate {
  name: string;
}

// ══════════════════════════════════════════════════════════
// USER SERVICE — /users
// ══════════════════════════════════════════════════════════

export const UserService = {
  /**
   * GET /users/me
   * Returns the currently authenticated user's profile.
   */
  
  getMe: (token: string) =>
    request<UserRead>('/users/me', { token }),

  /**
   * PATCH /users/me
   * Updates the current user's profile (name, password).
   */
  updateMe: (data: UserUpdate, token: string) =>
    request<UserRead>('/users/me', { method: 'PATCH', body: data, token }),

  /**
   * GET /users
   * Lists all users in the current org (admin only).
   */
  listUsers: (token: string, skip = 0, limit = 100) =>
    request<UserRead[]>(`/users?skip=${skip}&limit=${limit}`, { token }),

  /**
   * GET /users/:id
   * Gets a specific user within the same org.
   */
  getUser: (userId: string, token: string) =>
    request<UserRead>(`/users/${userId}`, { token }),
};

// ══════════════════════════════════════════════════════════
// ORGANIZATION SERVICE — /organizations
// ══════════════════════════════════════════════════════════

export const OrganizationService = {
  /**
   * GET /organizations/me
   * Returns the current user's organization.
   */
  getMyOrg: (token: string) =>
    request<OrganizationRead>('/organizations/me', { token }),

  /**
   * PATCH /organizations/me
   * Updates the organization's profile (name, slug, industry).
   */
  updateMyOrg: (data: OrganizationUpdate, token: string) =>
    request<OrganizationRead>('/organizations/me', { method: 'PATCH', body: data, token }),
};

// ══════════════════════════════════════════════════════════
// DOCUMENT SERVICE — /documents
// ══════════════════════════════════════════════════════════

export const DocumentService = {
  /**
   * POST /documents/upload
   * Sends multipart/form-data. Returns full DocumentRead.
   */
  upload: async (file: File, token: string): Promise<DocumentRead> => {
    const form = new FormData();
    form.append('file', file);

    const res = await fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      // Do NOT set Content-Type — browser sets it with the boundary
      body: form,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail ?? `HTTP ${res.status}`);
    }
    return res.json();
  },

  /** GET /documents?skip=&limit=&search= */
  list: (token: string, skip = 0, limit = 50, search?: string): Promise<DocumentListItem[]> => {
    const params = new URLSearchParams({
      skip: String(skip),
      limit: String(limit),
      ...(search ? { search } : {}),
    });
    return request<DocumentListItem[]>(`/documents?${params}`, { token });
  },

  /** GET /documents/:id */
  get: (id: string, token: string): Promise<DocumentRead> =>
    request<DocumentRead>(`/documents/${id}`, { token }),

  /** DELETE /documents/:id */
  delete: (id: string, token: string): Promise<void> =>
    request<void>(`/documents/${id}`, { method: 'DELETE', token }),
};

// ══════════════════════════════════════════════════════════
// CHAT SERVICE — /chats
// ══════════════════════════════════════════════════════════

export const ChatService = {
  /** POST /chats — Creates a new chat session. */
  createChat: (data: ChatCreate, token: string) =>
    request<ChatRead>('/chats', { method: 'POST', body: data, token }),
 
  /** GET /chats — Lists all chats for the current user in the org. */
  listChats: (token: string) =>
    request<ChatRead[]>('/chats', { token }),
 
  /** GET /chats/:id — Gets a specific chat. */
  getChat: (chatId: string, token: string) =>
    request<ChatRead>(`/chats/${chatId}`, { token }),
 
  /** GET /chats/:id/messages — Lists all messages in a chat. */
  listMessages: (chatId: string, token: string) =>
    request<ChatMessageRead[]>(`/chats/${chatId}/messages`, { token }),
 
  /** POST /chats/:id/messages — Sends a message in a chat. */
  sendMessage: (chatId: string, data: ChatMessageCreate, token: string) =>
    request<ChatMessageRead>(`/chats/${chatId}/messages`, { method: 'POST', body: data, token }),
};


// ══════════════════════════════════════════════════════════
// WORKFLOW SERVICE — /workflows
// ══════════════════════════════════════════════════════════

export const WorkflowService = {
  /**
   * POST /workflows
   * Creates a new workflow (starts as draft).
   */
  createWorkflow: (data: WorkflowCreate, token: string) =>
    request<WorkflowRead>('/workflows', { method: 'POST', body: data, token }),

  /**
   * GET /workflows
   * Lists all workflows for the current org.
   */
  listWorkflows: (token: string) =>
    request<WorkflowRead[]>('/workflows', { token }),
};