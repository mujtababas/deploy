"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function Cart() {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (session) {
      fetch(`/api/cart/${session.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.items) {
            setCartItems(data.items);
          } else {
            toast.error("Failed to fetch cart items");
          }
        })
        .catch(() => {
          toast.error("An error occurred while fetching cart items");
        });
    }
  }, [session]);

  const handleRemoveFromCart = async (itemId) => {
    const response = await fetch(`/api/cart/remove`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: session.user.id, itemId }),
    });

    if (response.ok) {
      setCartItems(cartItems.filter(item => item.id !== itemId));
      toast.success("Item removed from cart successfully!");
    } else {
      toast.error("Failed to remove item from cart");
    }
  };

  return (
    <div>
      <h2>Your Cart</h2>
      {cartItems.length > 0 ? (
        cartItems.map(item => (
          <div key={item.id}>
            <p>{item.product.name}</p>
            <button onClick={() => handleRemoveFromCart(item.id)}>Remove</button>
          </div>
        ))
      ) : (
        <p>Your cart is empty.</p>
      )}
    </div>
  );
}
