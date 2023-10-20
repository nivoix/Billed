/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import { localStorageMock } from "../__mocks__/localStorage.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store.js";
import BillsUI from "../views/BillsUI.js";
import { ROUTES } from "../constants/routes.js";
import userEvent from "@testing-library/user-event"


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
    test("then this new file should be correct in the input", () => {
      Object.defineProperty(window, "localStorage", {value: localStorageMock});
      window.localStorage.setItem("user",JSON.stringify({type: "Employee"}));

      const onNavigate = (pathname) => {document.body.innerHTML = ROUTE({ pathname })};

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBills = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage});

      const handleChangeFile = jest.fn((e) => newBills.handleChangeFile(e));
      const fileInput = screen.getByTestId("file");
      fileInput.addEventListener("change", handleChangeFile);
      // fireEvent.change(fileInput, {
      //   target: {files: [new File(["bill.png"], "bill.png", { type: "image/png" })]},
      // });
      userEvent.upload(fileInput, file)
      expect(fileInput.files[0].name).toBeDefined();
      expect(handleChangeFile).toHaveBeenCalled();
    });
    test("Then the upload fail", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const file = screen.getByTestId("file")
      const onNavigate = (pathname) => {document.body.innerHTML = ROUTE({ pathname })};
      const newBills = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})
      const handleChangeFile = jest.fn(newBills.handleChangeFile)
      file.addEventListener("change", handleChangeFile)
      fireEvent.change(file, {
        target: {
         files: [new File(["image"], "test.pdf", {type: "image/pdf"})]
        }
      })
      expect(file.value).toBe('')
    })
  });

  describe("When I submit form", () => {
    test("Then, I should be sent on Bills page", () => {
      Object.defineProperty(window, "localStorage", {value: localStorageMock});
      window.localStorage.setItem("user", JSON.stringify({type: "Employee"}));

      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })};

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBills = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage});

      const handleSubmit = jest.fn((e) => newBills.handleSubmit(e));
      const newBillForm = screen.getByTestId("form-new-bill");
      newBillForm.addEventListener("submit", handleSubmit);

      fireEvent.submit(newBillForm);

      expect(handleSubmit).toHaveBeenCalled();
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
  });
})


// 
// //////////////////////////////////////////////
// 
// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I send a new Bill", () => {
    test("add bill to mock API POST", async () => {
      const getSpy = jest.spyOn(mockStore, "bills");

      const newBill = {
        id: "47qAXb6fIm2zOKkLzMro",
        vat: "80",
        fileUrl:
          "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: "encore",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2004-04-04",
        amount: 400,
        commentAdmin: "ok",
        email: "a@a",
        pct: 20,
      };
      const bills = mockStore.bills(newBill);
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect((await bills.list()).length).toBe(4);
    });
  })
  describe("When an error occurs on API", () => {
       
    test("add bill to an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => Promise.reject(new Error("Erreur 404")));
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();

    })

    test("add bill to an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => Promise.reject(new Error("Erreur 500")))

      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    })
  })
})
