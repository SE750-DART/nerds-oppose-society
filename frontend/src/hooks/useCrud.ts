import { useState } from "react";

export type CrudHookType<Type> = {
  items: Type[];
  initialiseItems: (initialItems: Type[]) => void;
  addItem: (item: Type) => void;
  addItems: (items: Type[]) => void;
  removeItem: (itemToRemove: Type) => void;
  updateItem: (updatedItem: Type) => void;
};

const useCrud = <Type>(
  equals: (item1: Type, item2: Type) => boolean,
  initialState: Type[] = []
) => {
  const [items, setItems] = useState<Type[]>(initialState);

  const initialiseItems = (initialItems: Type[]) => {
    if (items.length === 0) {
      setItems(initialItems);
    }
  };

  const addItem = (item: Type) => setItems([...items, item]);

  const addItems = (itemsToAdd: Type[]) => setItems([...items, ...itemsToAdd]);

  const removeItem = (itemToRemove: Type) =>
    setItems(items.filter((item) => !equals(item, itemToRemove)));

  const updateItem = (updatedItem: Type) =>
    setItems(
      items.map((item) =>
        equals(item, updatedItem)
          ? {
              ...item,
              ...updatedItem,
            }
          : item
      )
    );

  return {
    items,
    addItems,
    initialiseItems,
    addItem,
    removeItem,
    updateItem,
  };
};

export default useCrud;
