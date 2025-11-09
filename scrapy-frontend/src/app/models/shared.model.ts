export interface Toast {
  id: number;
  message: string;
}

export interface Auth {
  userId: string;
}

export interface Tab {
  name: string;
  path: string;
  icon?: string;
}
