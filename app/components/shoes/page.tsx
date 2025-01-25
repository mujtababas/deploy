"use client";

import Image from "next/image";
import Link from 'next/link';
import { client } from "@/sanity/lib/client";
import { four } from "@/sanity/lib/querise";
import { Product } from "@/types/product";
import { urlFor } from "@/sanity/lib/image";
import React, { useEffect, useState } from "react";
import { FiSearch, FiShoppingCart, FiFilter, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const SHOES = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const fetchedProducts: Product[] = await client.fetch(four);
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    async function fetchCart() {
      if (session?.user) {
        try {
          const response = await fetch('/api/cart');
          if (response.ok) {
            const cart = await response.json();
            if (cart?.items) {
              const itemsWithDetails = await Promise.all(
                cart.items.map(async (item: any) => {
                  const product = await client.fetch(
                    `*[_type == "product" && _id == $id][0]`,
                    { id: item.productId }
                  );
                  return {
                    ...item,
                    name: product.name,
                    image: product.image,
                    price: product.price,
                  };
                })
              );
              setCartItems(itemsWithDetails);
            }
          }
        } catch (error) {
          console.error('Error fetching cart:', error);
        }
      }
    }

    fetchCart();
  }, [session]);

  const addToCart = async (product: Product) => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
          price: product.price,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      const cart = await response.json();
      if (cart?.items) {
        const itemsWithDetails = await Promise.all(
          cart.items.map(async (item: any) => {
            const product = await client.fetch(
              `*[_type == "product" && _id == $id][0]`,
              { id: item.productId }
            );
            return {
              ...item,
              name: product.name,
              image: product.image,
              price: product.price,
            };
          })
        );
        setCartItems(itemsWithDetails);
      }
      setShowQuickView(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/cart/item/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove from cart');
      }

      setCartItems(prev => prev.filter(item => item._id !== productId));
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert('Failed to remove item from cart');
    }
  };

  const handleCheckout = () => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }
    router.push('/checkout');
  };

  // Filter and sort products
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(product => product.category === selectedCategory);
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredProducts(result);
  }, [products, searchQuery, selectedCategory, sortBy]);

  const openQuickView = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header with search and cart */}
      <div className="flex justify-between items-center mb-8">
        <div className="relative flex-1 max-w-xl">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center ml-4 space-x-4">
          <select
            className="border rounded-lg px-4 py-2"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
          <button
            className="relative p-2"
            onClick={() => setShowCart(true)}
          >
            <FiShoppingCart className="text-2xl" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map((product) => (
          <div key={product._id} className="relative">
            <Link href={`/product/${product._id}`}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer">
                {product.image && (
                  <div className="relative w-full h-60">
                    <Image
                      src={urlFor(product.image).url()}
                      alt={product.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                  <p className="mt-2 text-gray-600">{formatPrice(product.price)}</p>
                </div>
              </div>
            </Link>
            <button
              onClick={(e) => openQuickView(e, product)}
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
            >
              Quick View
            </button>
          </div>
        ))}
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {showQuickView && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowQuickView(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                <button onClick={() => setShowQuickView(false)}>
                  <FiX className="text-2xl" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative h-80">
                  {selectedProduct.image && (
                    <Image
                      src={urlFor(selectedProduct.image).url()}
                      alt={selectedProduct.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  )}
                </div>
                <div>
                  <p className="text-xl font-semibold mb-2">{formatPrice(selectedProduct.price)}</p>
                  <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                  <button
                    onClick={() => {
                      addToCart(selectedProduct);
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shopping Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween' }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 h-full w-96 bg-white shadow-lg"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Shopping Cart</h2>
                  <button onClick={() => setShowCart(false)}>
                    <FiX className="text-2xl" />
                  </button>
                </div>
                {cartItems.length === 0 ? (
                  <p className="text-gray-500">Your cart is empty</p>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item._id} className="flex items-center space-x-4">
                        <div className="relative w-20 h-20">
                          {item.image && (
                            <Image
                              src={urlFor(item.image).url()}
                              alt={item.name}
                              layout="fill"
                              objectFit="cover"
                              className="rounded"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-gray-600">{formatPrice(item.price)}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between mb-4">
                        <span className="font-semibold">Total:</span>
                        <span className="font-semibold">
                          {formatPrice(cartItems.reduce((sum, item: any) => sum + (item.price * item.quantity), 0))}
                        </span>
                      </div>
                      <button
                        onClick={handleCheckout}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SHOES;
