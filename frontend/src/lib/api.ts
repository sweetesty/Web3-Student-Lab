import apiClient from "./api-client";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  instructor: string;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  studentId: string;
  courseId: string;
  issuedAt: string;
  certificateHash?: string;
  status: string;
  student?: User;
  course?: Course;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  status: string;
  student?: User;
  course?: Course;
}

export interface Feedback {
  id: string;
  studentId: string;
  courseId: string;
  rating: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
  student?: User;
  course?: Course;
}

// Authentication APIs
export const authAPI = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/register", data, { encrypt: true } as any);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get("/auth/me");
    return response.data.user;
  },
};

// Courses APIs
export const coursesAPI = {
  getAll: async (): Promise<Course[]> => {
    const response = await apiClient.get("/courses");
    return response.data;
  },

  getById: async (id: string): Promise<Course> => {
    const response = await apiClient.get(`/courses/${id}`);
    return response.data;
  },

  create: async (data: Partial<Course>): Promise<Course> => {
    const response = await apiClient.post("/courses", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Course>): Promise<Course> => {
    const response = await apiClient.put(`/courses/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/courses/${id}`);
  },
};

// Certificates APIs
export const certificatesAPI = {
  issue: async (data: {
    studentId: string;
    courseId: string;
  }): Promise<Certificate> => {
    const response = await apiClient.post("/certificates", data);
    return response.data;
  },

  getAll: async (): Promise<Certificate[]> => {
    const response = await apiClient.get("/certificates");
    return response.data;
  },

  getByStudentId: async (studentId: string): Promise<Certificate[]> => {
    const response = await apiClient.get(`/certificates/student/${studentId}`);
    return response.data;
  },

  getById: async (id: string): Promise<Certificate> => {
    const response = await apiClient.get(`/certificates/${id}`);
    return response.data;
  },

  verifyOnChain: async (
    certificateId: string,
  ): Promise<{ verified: boolean; hash?: string }> => {
    const response = await apiClient.get(
      `/certificates/${certificateId}/verify`,
    );
    return response.data;
  },
};

// Enrollments APIs
export const enrollmentsAPI = {
  getAll: async (): Promise<Enrollment[]> => {
    const response = await apiClient.get("/enrollments");
    return response.data;
  },

  getByStudentId: async (studentId: string): Promise<Enrollment[]> => {
    const response = await apiClient.get(`/enrollments/student/${studentId}`);
    return response.data;
  },

  enroll: async (studentId: string, courseId: string): Promise<Enrollment> => {
    const response = await apiClient.post("/enrollments", {
      studentId,
      courseId,
    });
    return response.data;
  },

  updateStatus: async (id: string, status: string): Promise<Enrollment> => {
    const response = await apiClient.put(`/enrollments/${id}`, { status });
    return response.data;
  },
};

// Feedback APIs
export interface FeedbackSummary {
  averageRating: number;
  totalReviews: number;
}

export const feedbackAPI = {
  submit: async (data: {
    courseId: string;
    rating: number;
    review?: string;
  }): Promise<Feedback> => {
    const response = await apiClient.post("/feedback", data);
    return response.data;
  },

  getByCourseId: async (courseId: string): Promise<Feedback[]> => {
    const response = await apiClient.get(`/feedback/course/${courseId}`);
    return response.data;
  },

  getSummary: async (courseId: string): Promise<FeedbackSummary> => {
    const response = await apiClient.get(
      `/feedback/course/${courseId}/summary`,
    );
    return response.data;
  },
};

// Dashboard APIs

export interface DashboardStats {
  coursesCount: number;
  studentsCount: number;
  certificatesCount: number;
  verificationRate: string;
}

export interface StudentDashboard {
  userId: string;
  progress: Record<string, unknown>;
  certificates: Record<string, unknown>[];
  tokenBalance: Record<string, unknown>;
  recentActivity: string[];
}

export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get("/dashboard/stats");
    return response.data;
  },

  getStudentDashboard: async (studentId: string): Promise<StudentDashboard> => {
    const response = await apiClient.get(`/dashboard/student/${studentId}`);
    return response.data;
  },
};

// Analytics APIs
export const analyticsAPI = {
  getGlobalStats: async (): Promise<any> => {
    const response = await apiClient.get("/analytics/global-stats");
    return response.data;
  },
};
// Activity APIs
export interface ActivityEntry {
  date: string;
  count: number;
  labs?: string[];
}

export interface ActivityResponse {
  activities: ActivityEntry[];
  classAverage: ActivityEntry[];
}

export const activityAPI = {
  getStudentActivity: async (): Promise<ActivityResponse> => {
    const response = await apiClient.get("/activity");
    return response.data;
  },
};
