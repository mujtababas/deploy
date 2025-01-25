"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Checkout from "../components/checkout/page";
import { client } from "@/sanity/lib/client";

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

interface CartItemWithDetails extends CartItem {
  name: string;
  image: any;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchCart() {
      if (session?.user) {
        try {
          const response = await fetch("/api/cart");
          if (response.ok) {
            const cart = await response.json();
            if (cart?.items) {
              // Fetch product details for each cart item
              const itemsWithDetails = await Promise.all(
                cart.items.map(async (item: CartItem) => {
                  const product = await client.fetch(
                    `*[_type == "product" && _id == $id][0]`,
                    { id: item.productId }
                  );
                  return {
                    ...item,
                    name: product.name,
                    image: product.image,
                  };
                })
              );
              setCartItems(itemsWithDetails);
            }
          }
        } catch (error) {
          console.error("Error fetching cart:", error);
        } finally {
          setLoading(false);
        }
      }
    }

    if (status === "authenticated") {
      fetchCart();
    }
  }, [session, status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return <Checkout cartItems={cartItems} total={total} />;
}
