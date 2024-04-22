  export interface Product {
    id?: string;
    type?: string;
    name?: string;
    price?: number;
    quantity?: number;
    subtotal?: number;
    description?: string;
    notes?: string;
    active?: boolean;
    toppings?: Product[];
    sauce?: Product[];
    combo?: Product[];
  }

