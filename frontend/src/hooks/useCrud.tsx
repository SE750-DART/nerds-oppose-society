import { useState } from "react";

function useCrud<Type>(initialState: Type[] = []) {
  const [items, setItems] = useState<Type[]>(initialState);

  const initialiseItems = (initialItems: Type[]) => {
    if (items.length === 0) {
      setItems(initialItems);
    }
  };

  const addItem = (item: Type) => setItems([...items, item]);

  const removeItem = (
    itemToRemove: Type,
    equals: (item1: Type, item2: Type) => boolean
  ) => setItems(items.filter((item) => !equals(item, itemToRemove)));

  const updateItem = (
    updatedItem: Type,
    equals: (item1: Type, item2: Type) => boolean
  ) =>
    setItems(
      items.map((item) =>
        equals(item, updatedItem)
          ? {
              item,
              ...updatedItem,
            }
          : item
      )
    );

  return {
    items,
    initialiseItems,
    addItem,
    removeItem,
    updateItem,
  };
}

export default useCrud;
