/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import { localStorageMock } from "../__mocks__/localStorage.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store.js";
import { ROUTES } from "../constants/routes.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the form should appear", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const newBillForm = screen.getByTestId("form-new-bill");
      expect(newBillForm).toBeTruthy();
    })
  })
  describe("when I add an image file as bill proof", () => {
    test("then this new file should have been changed in the input", () => {
      Object.defineProperty(window, "localStorage", {value: localStorageMock});
      window.localStorage.setItem("user",JSON.stringify({type: "Employee"}));

      const onNavigate = (pathname) => {document.body.innerHTML = ROUTE({ pathname })};

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBills = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage});

      const handleChangeFile = jest.fn((e) => newBills.handleChangeFile);
      const fileInput = screen.getByTestId("file");

      fileInput.addEventListener("change", handleChangeFile);
      fireEvent.change(fileInput, {
        target: {files: [new File(["bill.png"], "bill.png", { type: "image/png" })]},
      });
      expect(handleChangeFile).toHaveBeenCalled();
      expect(fileInput.files[0].name).toBe("bill.png");
    });
  });

  describe("When I submit form", () => {
    test("Then, I should be sent on Bills page", () => {
      Object.defineProperty(window, "localStorage", {value: localStorageMock});
      window.localStorage.setItem("user", JSON.stringify({type: "Employee"}));

      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })};

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBills = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage});

      const handleSubmit = jest.fn((e) => newBills.handleSubmit);
      const newBillForm = screen.getByTestId("form-new-bill");
      newBillForm.addEventListener("submit", handleSubmit);

      fireEvent.submit(newBillForm);

      expect(handleSubmit).toHaveBeenCalled();
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
  });
})
