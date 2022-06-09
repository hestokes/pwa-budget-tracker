let db;

// request for new db, budget database
const request = indexedDB.open("budgetDB", 1);

// create object store whene a thing is updated/changed
request.onupgradeneeded = (event) => {
  console.log("this is working");
  db = event.target.result;
  // creating object store names budgetStore
  db.createObjectStore("budgetStore", { autoIncrement: true });
};

// log errors
request.onerror = function (event) {
  console.log(event.target.errorCode);
};

// if successfull
request.onsuccess = (event) => {
  console.log("success");
  // whats the navigator
  if (navigator.onLine) {
    checkDB();
  }
};

const saveRecord = (record) => {
    console.log("Record Saved offline");
  // opens transaction to allow access to budget objectStore
  const transaction = db.transaction(["budgetStore"], "readwrite");
  // access buget object store
  const store = transaction.objectStore("budgetStore");
  // adds input (use spread, don't have to but we can)
  store.add(record);
};