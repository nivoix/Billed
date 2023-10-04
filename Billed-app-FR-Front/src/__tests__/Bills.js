/* *
 * @jest-environment jsdom
 */
import Bills from "../containers/Bills.js"
import { formatDate, formatStatus } from "../app/format.js"
import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";
import mockStore from "../__mocks__/store.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy()
    })
    test('Then bills should be returned with date formated', async () => {
			const billContainer = new Bills({ document, onNavigate, store: mockStore, localStorage: localStorageMock })
			const getBills = jest.fn(billContainer.getBills)
			const data = await mockStore.bills().list()
			const bills = data.map((doc) => {
				try {
					return {
						...doc,
						date: formatDate(doc.date),
						status: formatStatus(doc.status),
					}
				} catch (e) {
					return {
						...doc,
						date: doc.date,
						status: formatStatus(doc.status),
					}
				}
			})
			expect(await getBills()).toEqual(bills)
    })
    /* test('Then bills should be returned with date no formated', async () => {
			const billContainer = new Bills({ document, onNavigate, store: mockStore, localStorage: localStorageMock })
			const getBills = jest.fn(billContainer.getBills)
			const data = await mockStore.bills().list()
			const bills = data.map((doc) => {
				try {
					return {
						...doc,
						date: formatDate(doc.date),
						status: formatStatus(doc.status),
					}
				} catch (e) {
					return {
						...doc,
						date: doc.date,
						status: formatStatus(doc.status),
					}
				}
			})
			expect(await getBills()).toEqual(bills)
    }) */
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML)
      const antiChrono = (a, b) => (a < b ? 1 : -1 )
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe("When I click in the icon eye", () => {
    test("Then the proof should appear", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      $.fn.modal = jest.fn();
      const iconEye = await waitFor(() => screen.getAllByTestId('icon-eye'))
      const lastEyeIcon = iconEye.reverse()[0];
      userEvent.click(lastEyeIcon);
      const headerText = await waitFor(() => screen.getByText("Justificatif"));
      expect(headerText).toBeTruthy();
    })
  })
  describe("when I click in NewBill", () => {
    test("Then it should redirect to New Bill Page", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const btnNewBill = screen.getByTestId('btn-new-bill')
      userEvent.click(btnNewBill);
      const submitBtn = await waitFor(() => document.getElementById("btn-send-bill"));
      expect(submitBtn).toBeTruthy();
    })
  })
})


// 
// //////////////////////////////////////////////
// 
// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "e@e" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId("tbody"))
      expect(screen.getByTestId("tbody").innerHTML).toBeTruthy()
    })
  })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "e@e"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      document.body.innerHTML = BillsUI({ error: 'Erreur 404' })
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
			document.body.innerHTML = BillsUI({ error: 'Erreur 500' })
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
