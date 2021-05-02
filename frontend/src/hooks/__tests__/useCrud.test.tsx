import { act, renderHook, RenderResult } from "@testing-library/react-hooks";
import useCrud, { CrudHookType } from "../useCrud";

type TestItem = {
  name: string;
  val: number;
};
const equals = (item1: TestItem, item2: TestItem) => item1.name === item2.name;

let result: RenderResult<CrudHookType<TestItem>>;
beforeEach(() => {
  result = renderHook(() => useCrud<TestItem>()).result;
});

test("initialiseItems() should update items with initial items", () => {
  const initialItems = [
    {
      name: "test1",
      val: 0,
    },
    {
      name: "test2",
      val: 1,
    },
  ];
  act(() => result.current.initialiseItems(initialItems));

  expect(result.current.items).toEqual(initialItems);
});

test("addItem() should update items with new item", () => {
  const newItem = {
    name: "test1",
    val: 0,
  };
  act(() => result.current.addItem(newItem));

  expect(result.current.items).toEqual([newItem]);
});

test("removeItem() should remove item", () => {
  // addItem() has also been unit tested separately above,
  // so if there is an error here but not in that test
  // then it must be an error in removeItem()
  const newItem = {
    name: "test1",
    val: 0,
  };
  act(() => result.current.addItem(newItem));
  expect(result.current.items).toEqual([newItem]);

  act(() => result.current.removeItem(newItem, equals));
  expect(result.current.items).toEqual([]);
});

test("updateItem() should update item with new string", () => {
  // addItem() has also been unit tested separately above,
  // so if there is an error here but not in that test
  // then it must be an error in updateItem()
  const newItem = {
    name: "test1",
    val: 0,
  };
  act(() => result.current.addItem(newItem));
  expect(result.current.items).toEqual([newItem]);

  const updatedItem = {
    ...newItem,
    val: 1,
  };
  act(() => result.current.updateItem(updatedItem, equals));
  expect(result.current.items).toEqual([updatedItem]);
});
