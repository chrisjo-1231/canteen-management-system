import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type CartFood = {
  id: number;
  name: string;
  price: string;
  image?: string;
  category: {
    name: string;
  };
};

export type CartItem = {
  food: CartFood;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (food: CartFood) => void;
  removeFromCart: (foodId: number) => void;
  increaseQuantity: (foodId: number) => void;
  decreaseQuantity: (foodId: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (food: CartFood) => {
    setItems((current) => {
      const existingItem = current.find(
        (item) => item.food.id === food.id
      );

      if (existingItem) {
        return current.map((item) =>
          item.food.id === food.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...current,
        {
          food,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (foodId: number) => {
    setItems((current) =>
      current.filter((item) => item.food.id !== foodId)
    );
  };

  const increaseQuantity = (foodId: number) => {
    setItems((current) =>
      current.map((item) =>
        item.food.id === foodId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (foodId: number) => {
    setItems((current) =>
      current
        .map((item) =>
          item.food.id === foodId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalPrice = items.reduce(
    (total, item) =>
      total + Number(item.food.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}