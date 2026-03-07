// inventory.js

document.addEventListener("DOMContentLoaded", function () {

  // ------------------ تعريف المتغيرات ------------------
  const addProductBtn = document.getElementById("addProductBtn");
  const productModal = new bootstrap.Modal(document.getElementById("productModal"));
  const productModalTitle = document.getElementById("productModalTitle");
  const saveProductBtn = document.getElementById("saveProductBtn");

  const productNameInput = document.getElementById("productName");
  const productQuantityInput = document.getElementById("productQuantity");
  const productCategoryInput = document.getElementById("productCategory");

  let editingProductId = null;

  // ربط الجداول بكل قسم
  const tables = {
    "مبيدات": document.querySelector("#pesticidesTable tbody"),
    "آلات": document.querySelector("#machinesTable tbody"),
    "تقاوي": document.querySelector("#seedsTable tbody"),
    "أسمدة": document.querySelector("#fertilizersTable tbody")
  };

  // تتبع اتجاه الترتيب لكل جدول وعمود
  const sortDirections = {};

  // ------------------ حفظ الـ Tabs في LocalStorage ------------------
  // حفظ آخر Tab رئيسية
  document.querySelectorAll('#mainTabs button').forEach(btn => {
    btn.addEventListener('shown.bs.tab', (e) => {
      localStorage.setItem('activeMainTab', e.target.id);
    });
  });

  // حفظ آخر Tab فرعية للمخزون
  document.querySelectorAll('#inventoryTabs button').forEach(btn => {
    btn.addEventListener('shown.bs.tab', (e) => {
      localStorage.setItem('activeInventoryTab', e.target.id);
    });
  });

  // ------------------ 1 – تحميل كل المنتجات وعرضها ------------------
  function loadInventory() {
    Object.values(tables).forEach(tbody => tbody.innerHTML = "");

    db.collection("inventory").orderBy("updatedAt", "desc").get().then((snapshot) => {
      snapshot.forEach((doc) => {
        const product = doc.data();
        const tr = document.createElement("tr");

        const createdAt = product.createdAt
          ? product.createdAt.toDate().toLocaleString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
          : "-";

        const updatedAt = product.updatedAt
          ? product.updatedAt.toDate().toLocaleString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
          : "-";

        tr.innerHTML = `
          <td data-label="اسم المنتج" data-key="name">${product.name}</td>
          <td data-label="الكمية" data-key="quantity">${product.quantity}</td>
          <td data-label="تاريخ الإضافة" data-key="createdAt">${createdAt}</td>
          <td data-label="آخر تعديل" data-key="updatedAt">${updatedAt}</td>
          <td>
            <button class="btn btn-sm btn-warning me-1" 
              onclick="editProduct('${doc.id}', '${product.name}', ${product.quantity}, '${product.category}')">
              <i class="bi bi-pencil-square me-1"></i> تعديل
            </button>
            <button class="btn btn-sm btn-danger" 
              onclick="deleteProduct('${doc.id}')">
              <i class="bi bi-trash me-1"></i> حذف
            </button>
          </td>
        `;

        if (tables[product.category]) {
          tables[product.category].appendChild(tr);
        }
      });
    });
  }

  // ------------------ 2 – فتح Modal لإضافة منتج ------------------
  addProductBtn.addEventListener("click", () => {
    editingProductId = null;
    productModalTitle.innerText = "إضافة منتج";
    productNameInput.value = "";
    productQuantityInput.value = "";
    productCategoryInput.value = "";
    productModal.show();
  });

// ------------------ 3 – حفظ (إضافة أو تعديل) ------------------
saveProductBtn.addEventListener("click", () => {
  const name = productNameInput.value.trim();
  const quantity = parseInt(productQuantityInput.value, 10);
  const category = productCategoryInput.value;

  // التحقق من كل الحقول
  if (!name || !category || isNaN(quantity)) {
    alert("كل حقول الفورم مطلوبة!");
    return;
  }

  if (editingProductId) {
    db.collection("inventory").doc(editingProductId).update({
      name,
      quantity,
      category,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      productModal.hide();
      loadInventory();
    });
  } else {
    db.collection("inventory").add({
      name,
      quantity,
      category,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      productModal.hide();
      loadInventory();
    });
  }
});

  // ------------------ 4 – تعديل منتج ------------------
  window.editProduct = (id, currentName, currentQuantity, currentCategory) => {
    editingProductId = id;
    productModalTitle.innerText = "تعديل منتج";
    productNameInput.value = currentName;
    productQuantityInput.value = currentQuantity;
    productCategoryInput.value = currentCategory;
    productModal.show();
  };

  // ------------------ 5 – حذف منتج ------------------
  const confirmDeleteModal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"));
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

  window.requestDelete = (message, action) => {
    const messageEl = document.getElementById("deleteModalMessage");
    if (messageEl) messageEl.innerText = message;
    window.pendingDeleteAction = action;
    confirmDeleteModal.show();
  };

  if (confirmDeleteBtn && !confirmDeleteBtn.dataset.listenerSet) {
    confirmDeleteBtn.addEventListener("click", () => {
      if (window.pendingDeleteAction) {
        window.pendingDeleteAction();
        window.pendingDeleteAction = null;
        confirmDeleteModal.hide();
      }
    });
    confirmDeleteBtn.dataset.listenerSet = "true";
  }

  window.deleteProduct = (id) => {
    window.requestDelete("هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً؟ لا يمكن التراجع عن هذه العملية.", () => {
      db.collection("inventory").doc(id).delete().then(() => loadInventory());
    });
  };

  // ------------------ 6 – ترتيب الجدول ------------------
  window.sortTable = (tableId, key) => {
    const tbody = document.querySelector(`#${tableId} tbody`);
    const rows = Array.from(tbody.querySelectorAll("tr"));

    if (!sortDirections[tableId]) sortDirections[tableId] = {};
    sortDirections[tableId][key] = !sortDirections[tableId][key];

    const asc = sortDirections[tableId][key];

    rows.sort((a, b) => {
      let valA = a.querySelector(`td[data-key="${key}"]`).innerText.trim();
      let valB = b.querySelector(`td[data-key="${key}"]`).innerText.trim();

      if (!isNaN(valA) && !isNaN(valB)) {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      }

      if (valA < valB) return asc ? -1 : 1;
      if (valA > valB) return asc ? 1 : -1;
      return 0;
    });

    rows.forEach(r => tbody.appendChild(r));
  };

  // ------------------ 7 – فلترة الاسم لكل جدول ------------------
  document.querySelectorAll(".searchInput").forEach(input => {
    input.addEventListener("keyup", (e) => {
      const filter = e.target.value.toLowerCase();
      const tbody = e.target.parentNode.nextElementSibling.querySelector("tbody");
      Array.from(tbody.querySelectorAll("tr")).forEach(tr => {
        const name = tr.querySelector("td[data-key='name']").innerText.toLowerCase();
        tr.style.display = name.includes(filter) ? "" : "none";
      });
    });
  });

  // ------------------ 8 – تحميل عند فتح الصفحة ------------------
  loadInventory();

  // ------------------ 9 – استرجاع آخر Tabs بعد التحديث ------------------
  const activeMainTabId = localStorage.getItem('activeMainTab');
  if (activeMainTabId) {
    const tab = new bootstrap.Tab(document.getElementById(activeMainTabId));
    tab.show();
  }

  const activeInventoryTabId = localStorage.getItem('activeInventoryTab');
  if (activeInventoryTabId) {
    const tab = new bootstrap.Tab(document.getElementById(activeInventoryTabId));
    tab.show();
  }


});

