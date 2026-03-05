// sales.js

document.addEventListener("DOMContentLoaded", function () {

    // ------------------ تعريف المتغيرات ------------------
    const salesTableBody = document.querySelector("#salesTable tbody");
    const addSaleBtn = document.getElementById("addSaleBtn");
    const saleModal = new bootstrap.Modal(document.getElementById("saleModal"));
    const saleForm = document.getElementById("saleForm");
    const saleProductSelect = document.getElementById("saleProduct");
    const saleQuantityInput = document.getElementById("saleQuantity");
    const saveSaleBtn = document.getElementById("saveSaleBtn");

    let editingSaleId = null;

    // ------------------ 1 – تحميل كل المبيعات وعرضها ------------------
    function loadSales() {
        if (!salesTableBody) return;
        salesTableBody.innerHTML = "";

        db.collection("sales").orderBy("date", "desc").get().then((snapshot) => {

            const groupedSales = {};

            snapshot.forEach((doc) => {
                const sale = doc.data();
                const dateObj = sale.date.toDate();
                const monthKey = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}`;

                if (!groupedSales[monthKey]) groupedSales[monthKey] = [];
                groupedSales[monthKey].push({ id: doc.id, ...sale });
            });

            Object.keys(groupedSales).forEach((monthKey) => {
                const [year, month] = monthKey.split("-");
                const monthName = new Date(year, month - 1).toLocaleString('ar-EG', { month: 'long', year: 'numeric' });

                const monthHeaderRow = document.createElement("tr");
                monthHeaderRow.className = "month-header-row";
                monthHeaderRow.innerHTML = `
                  <td colspan="4">
                    <div class="month-header-container">
                      <div class="month-name-wrapper">
                          <span>📅</span>
                          <span>${monthName}</span>
                      </div>
                      <button class="btn btn-sm btn-delete-month" onclick="deleteMonth('${monthKey}')">
                          <i class="bi bi-trash me-1"></i> حذف هذا الشهر
                      </button>
                    </div>
                  </td>
              `;
                salesTableBody.appendChild(monthHeaderRow);

                groupedSales[monthKey].forEach((sale) => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                      <td data-label="اسم المنتج">${sale.productName}</td>
                      <td data-label="الكمية المباعة">${sale.quantitySold}</td>
                      <td data-label="التاريخ">${sale.date.toDate().toLocaleString('ar-EG')}</td>
                      <td>
                          <button class="btn btn-sm btn-warning me-1" 
                              onclick="openEditSaleModal('${sale.id}', '${sale.productId}', ${sale.quantitySold})">
                              <i class="bi bi-pencil-square me-1"></i> تعديل
                          </button>
                          <button class="btn btn-sm btn-info" 
                              onclick="deleteSaleWithRestore('${sale.id}', '${sale.productId}', ${sale.quantitySold})">
                              <i class="bi bi-arrow-counterclockwise me-1"></i> إرجاع إلى المخزون
                          </button>
                      </td>
                  `;
                    salesTableBody.appendChild(tr);
                });
            });
        });
    }

    // ------------------ 2 – فتح Modal لإضافة بيع جديد ------------------
    if (addSaleBtn) {
        addSaleBtn.addEventListener("click", async () => {
            try {
                const productsSnapshot = await db.collection("inventory").get();
                saleProductSelect.innerHTML = '<option value="" disabled selected>اختر المنتج</option>';
                let hasProducts = false;

                productsSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.quantity > 0) {
                        const option = document.createElement("option");
                        option.value = doc.id;
                        option.textContent = `${data.name} (المخزون: ${data.quantity})`;
                        saleProductSelect.appendChild(option);
                        hasProducts = true;
                    }
                });

                if (!hasProducts) return alert("لا يوجد منتجات في المخزون");

                saleQuantityInput.value = "";
                saleError.innerHTML = ""; // مسح الأخطاء السابقة
                editingSaleId = null;
                document.getElementById("saleModalTitle").innerText = "تسجيل بيع";
                saveSaleBtn.innerText = "حفظ";
                saleModal.show();

            } catch (err) {
                console.error(err);
                alert("حدث خطأ أثناء جلب المنتجات");
            }
        });
    }

    function showSaleError(message) {
        saleError.innerHTML = `
            <div class="sale-error-container">
                <i class="bi bi-exclamation-triangle-fill"></i>
                <span>${message}</span>
            </div>
        `;
    }

    // ------------------ 3 – حفظ البيع من الـ Modal ------------------
    if (saveSaleBtn) {
        saveSaleBtn.addEventListener("click", async () => {
            const productId = saleProductSelect.value;
            const quantitySold = parseInt(saleQuantityInput.value, 10);
            saleError.innerHTML = ""; // مسح الأخطاء السابقة

            if (!productId || isNaN(quantitySold) || quantitySold <= 0) {
                return showSaleError("الرجاء إدخال بيانات صحيحة");
            }

            try {
                const productDoc = await db.collection("inventory").doc(productId).get();
                const productData = productDoc.data();
                if (!productData || quantitySold > productData.quantity) {
                    return showSaleError("الكمية المطلوبة أكبر من المتوفر في المخزون!");
                }

                if (editingSaleId) {
                    // تعديل بيع
                    const saleDoc = await db.collection("sales").doc(editingSaleId).get();
                    const oldQuantity = saleDoc.data().quantitySold;
                    const diff = quantitySold - oldQuantity;

                    if (productData.quantity - diff < 0) return showSaleError("الكمية المطلوبة تتجاوز المخزون!");

                    await db.collection("sales").doc(editingSaleId).update({ quantitySold });
                    await db.collection("inventory").doc(productId).update({
                        quantity: productData.quantity - diff,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } else {
                    // إضافة بيع جديد
                    await db.collection("sales").add({
                        productId,
                        productName: productData.name,
                        quantitySold,
                        date: firebase.firestore.Timestamp.now()
                    });

                    await db.collection("inventory").doc(productId).update({
                        quantity: productData.quantity - quantitySold,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }

                saleModal.hide();
                loadInventory();
                loadSales();

            } catch (err) {
                console.error(err);
                alert("حدث خطأ أثناء حفظ البيع");
            }
        });
    }

    // ------------------ 4 – فتح Modal لتعديل البيع ------------------
    window.openEditSaleModal = async (saleId, productId, quantitySold) => {
        editingSaleId = saleId;
        saleProductSelect.value = productId;
        saleQuantityInput.value = quantitySold;
        document.getElementById("saleModalTitle").innerText = "تعديل البيع";
        saveSaleBtn.innerText = "تعديل";
        saleModal.show();
    };

    // ------------------ 5 – حذف بيع وإرجاع المخزون ------------------
    window.deleteSaleWithRestore = async (saleId, productId, quantitySold) => {
        window.requestDelete("سيتم إرجاع الكمية للمخزون وحذف العملية، هل أنت متأكد؟", async () => {
            try {
                const productDoc = await db.collection("inventory").doc(productId).get();
                if (productDoc.exists) {
                    const productData = productDoc.data();
                    await db.collection("inventory").doc(productId).update({
                        quantity: productData.quantity + quantitySold,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }

                await db.collection("sales").doc(saleId).delete();

                loadInventory();
                loadSales();

            } catch (err) {
                console.error(err);
                alert("حدث خطأ أثناء الحذف");
            }
        });
    };

    // ------------------ 6 – حذف الشهر بالكامل وإرجاع المخزون ------------------
    window.deleteMonth = async (monthKey) => {
        window.requestDelete("هل تريد حذف كل مبيعات هذا الشهر نهائيًا؟ سيتم إرجاع كافة الكميات للمخزون.", async () => {
            try {
                const snapshot = await db.collection("sales").get();
                const batch = db.batch();

                for (const doc of snapshot.docs) {
                    const sale = doc.data();
                    const dateObj = sale.date.toDate();
                    const key = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}`;
                    if (key === monthKey) {
                        const productDoc = await db.collection("inventory").doc(sale.productId).get();
                        if (productDoc.exists) {
                            const productData = productDoc.data();
                            batch.update(productDoc.ref, {
                                quantity: productData.quantity + sale.quantitySold,
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        }
                        batch.delete(doc.ref);
                    }
                }

                await batch.commit();
                loadInventory();
                loadSales();

            } catch (err) {
                console.error(err);
                alert("حدث خطأ أثناء حذف الشهر");
            }
        });
    };

    // ------------------ 7 – تحميل المبيعات عند فتح الصفحة ------------------
    loadSales();

});