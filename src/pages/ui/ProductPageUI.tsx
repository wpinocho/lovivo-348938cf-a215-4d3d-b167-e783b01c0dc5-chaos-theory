import { useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { EcommerceTemplate } from "@/templates/EcommerceTemplate"
import { ShoppingCart, ArrowLeft, Plus, Minus } from "lucide-react"
import { Link } from "react-router-dom"

import type { Product, ProductVariant } from "@/lib/supabase"

/**
 * EDITABLE UI COMPONENT - ProductPageUI
 * 
 * Este componente solo maneja la presentación de la página de producto.
 * Recibe toda la lógica como props del HeadlessProduct.
 * 
 * PUEDES MODIFICAR LIBREMENTE:
 * - Colores, temas, estilos
 * - Textos e idioma
 * - Layout y estructura visual
 * - Header y navegación
 * - Animaciones y efectos
 * - Agregar features visuales (zoom de imagen, etc.)
 */

interface ProductPageUIProps {
  logic: {
    // Product data
    product: any
    loading: boolean
    notFound: boolean
    
    // Selection state
    selected: Record<string, string>
    quantity: number
    
    // Calculated values
    matchingVariant: any
    currentPrice: number
    currentCompareAt: number | null
    currentImage: string | null
    inStock: boolean
    
    // Handlers
    handleOptionSelect: (optionName: string, value: string) => void
    handleQuantityChange: (quantity: number) => void
    handleAddToCart: () => void
    handleNavigateBack: () => void
    isOptionValueAvailable: (optionName: string, value: string) => boolean
    
    // Any other properties that might come from HeadlessProduct
    [key: string]: any
  }
}

export const ProductPageUI = ({ logic }: ProductPageUIProps) => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (logic.loading) {
    return (
      <EcommerceTemplate>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 py-16">
          <Skeleton className="aspect-square" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </EcommerceTemplate>
    )
  }

  if (logic.notFound) {
    return (
      <EcommerceTemplate>
        <div className="text-center py-32">
            <h1 className="text-6xl font-serif font-bold mb-6 text-black">Piece Not Found</h1>
            <p className="text-black/60 mb-12 tracking-[0.2em] uppercase text-sm">This artwork does not exist or has been removed</p>
            <Link 
              to="/"
              className="inline-flex items-center text-sm tracking-[0.2em] uppercase text-black hover:text-black/60 transition-colors"
            >
              <ArrowLeft className="mr-3 h-4 w-4" />
              Return to Collection
            </Link>
        </div>
      </EcommerceTemplate>
    )
  }

  if (!logic.product) return null

  return (
    <EcommerceTemplate>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 py-16">
        {/* Product Image - Gallery Style */}
        <div className="aspect-square overflow-hidden border border-black/5 bg-white">
          <img
            src={logic.currentImage || "/placeholder.svg"}
            alt={logic.product.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details - Minimalist */}
        <div className="space-y-8">
          {/* Title & Price */}
          <div className="border-b border-black/5 pb-8">
            <h1 className="text-5xl font-serif font-bold tracking-tight text-black mb-6">
              {logic.product.title}
            </h1>
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-serif text-black">
                {logic.formatMoney(logic.currentPrice)}
              </span>
              {logic.currentCompareAt && logic.currentCompareAt > logic.currentPrice && (
                <span className="text-xl text-black/40 line-through">
                  {logic.formatMoney(logic.currentCompareAt)}
                </span>
              )}
            </div>
            <p className="mt-4 text-xs tracking-[0.3em] uppercase text-black/50">
              Limited Edition • 2024
            </p>
          </div>

          {/* Description */}
          {logic.product.description && (
            <div>
              <h3 className="text-sm tracking-[0.2em] uppercase text-black/60 mb-4">About This Piece</h3>
              <div 
                className="text-black/70 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: logic.product.description }}
              />
            </div>
          )}

          {/* Product Options - Minimal */}
          {logic.product.options && logic.product.options.length > 0 && (
            <div className="space-y-6 border-b border-black/5 pb-8">
              {logic.product.options.map((option) => (
                <div key={option.name}>
                  <Label className="text-sm tracking-[0.2em] uppercase text-black/60 mb-3 block">
                    {option.name}
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    {option.values.map((value) => {
                      const isSelected = logic.selected[option.name] === value
                      const isAvailable = logic.isOptionValueAvailable(option.name, value)
                      
                      return (
                        <button
                          key={value}
                          disabled={!isAvailable}
                          onClick={() => logic.handleOptionSelect(option.name, value)}
                          className={`px-6 py-3 border text-sm tracking-wide transition-colors ${
                            isSelected 
                              ? 'bg-black text-white border-black' 
                              : 'bg-white text-black border-black/20 hover:border-black'
                          } ${!isAvailable ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                          {value}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity and Add to Cart - Clean */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-sm tracking-[0.2em] uppercase text-black/60">
                Quantity
              </Label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => logic.handleQuantityChange(Math.max(1, logic.quantity - 1))}
                  disabled={logic.quantity <= 1}
                  className="w-10 h-10 border border-black/20 hover:border-black disabled:opacity-30 transition-colors"
                >
                  <Minus className="h-4 w-4 mx-auto" />
                </button>
                <span className="text-lg font-serif w-12 text-center">{logic.quantity}</span>
                <button
                  onClick={() => logic.handleQuantityChange(logic.quantity + 1)}
                  className="w-10 h-10 border border-black/20 hover:border-black transition-colors"
                >
                  <Plus className="h-4 w-4 mx-auto" />
                </button>
              </div>
            </div>

            <button
              onClick={logic.handleAddToCart}
              disabled={!logic.inStock}
              className="w-full bg-black text-white py-4 text-sm tracking-[0.2em] uppercase hover:bg-black/90 disabled:bg-black/30 transition-colors"
            >
              {logic.inStock ? 'Acquire Piece' : 'Currently Unavailable'}
            </button>
          </div>

          {/* Product Info - Minimal */}
          {logic.matchingVariant && (
            <div className="border-t border-black/5 pt-8">
              <h3 className="text-sm tracking-[0.2em] uppercase text-black/60 mb-4">Details</h3>
              <div className="space-y-3 text-sm text-black/70">
                <div className="flex justify-between">
                  <span>Edition Number</span>
                  <span className="font-serif">{logic.matchingVariant.sku || '1/1'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Availability</span>
                  <span className="font-serif">{logic.matchingVariant.inventory_quantity || 0} in stock</span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-8">
            <Link
              to="/"
              className="inline-flex items-center text-sm tracking-[0.2em] uppercase text-black/60 hover:text-black transition-colors"
            >
              <ArrowLeft className="mr-3 h-4 w-4" />
              Back to Collection
            </Link>
          </div>
        </div>
      </div>
    </EcommerceTemplate>
  )
}