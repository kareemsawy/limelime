import { Product, Variant, ProductImage, Category, Order, OrderItem, User } from "@prisma/client";

export type ProductWithRelations = Product & {
  variants: Variant[];
  images: ProductImage[];
  category: Category | null;
};

export type OrderWithItems = Order & {
  items: (OrderItem & { product: Product; variant: Variant | null })[];
  user: User | null;
};
