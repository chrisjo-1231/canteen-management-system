import axios from "axios";

const API_URL = "http://localhost:5000/api";

export interface Food {
  id: number;
  name: string;
  description?: string;
  price: string;
  stock: number;
  image?: string;
  isAvailable: boolean;
  categoryId: number;
  category: {
    id: number;
    name: string;
  };
}

export interface Category {
  id: number;
  name: string;
}

export const getFoods = async () => {
  const response = await axios.get<Food[]>(`${API_URL}/foods`);
  return response.data;
};

export const getCategories = async () => {
  const response = await axios.get<Category[]>(
    `${API_URL}/categories`
  );

  return response.data;
};

export const createFood = async (data: {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  image?: string;
}) => {
  const response = await axios.post(`${API_URL}/foods`, data);

  return response.data;
};

export const updateFood = async (
  id: number,
  data: {
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: number;
    image?: string;
    isAvailable: boolean;
  }
) => {
  const response = await axios.put(
    `${API_URL}/foods/${id}`,
    data
  );

  return response.data;
};

export const deleteFood = async (id: number) => {
  const response = await axios.delete(
    `${API_URL}/foods/${id}`
  );

  return response.data;
};