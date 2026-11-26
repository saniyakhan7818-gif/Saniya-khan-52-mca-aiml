const API_URL = 'http://localhost:3000/api';

let products = [];
let cart = [];

// Switch Navigation Tabs
function showTab(tabName, evt) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabName + 'Section').classList.add('active');
    const activeBtn = evt ? evt.target : document.querySelector(`.nav-btn[onclick*="${tabName}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    if (tabName === 'products') loadProducts();
    if (tabName === 'cart') renderCart();
    if (tabName === 'orders') loadOrders();
    if (tabName === 'seller') loadProducts();
}

// 1. Fetch & Display Products
async function loadProducts() {
    try {
        const res = await fetch(`${API_URL}/products`);
        const data = await res.json();
        products = data.products || [];

        // Render customer product cards
        const grid = document.getElementById('productGrid');
        grid.innerHTML = products.length ? '' : '<p>No products available.</p>';
        products.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card product-card';
            card.innerHTML = `
                <div>
                    <h3>${p.name}</h3>
                    <p>${p.description}</p>
                </div>
                <div>
                    <div class="price">₹${p.price}</div>
                    <button class="btn btn-primary" onclick="addToCart('${p._id}')">Add to Cart</button>
                </div>
            `;
            grid.appendChild(card);
        });

        // Render seller inventory table
        renderSellerTable();
    } catch (err) {
        console.error('Failed to load products:', err);
    }
}

// 2. Cart Operations
function addToCart(productId) {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    const existing = cart.find(item => item._id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ _id: product._id, name: product.name, price: product.price, quantity: 1 });
    }
    updateCartCount();
    alert(`${product.name} added to cart!`);
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').innerText = count;
}

function renderCart() {
    const container = document.getElementById('cartItems');
    const summary = document.getElementById('cartSummary');

    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        summary.style.display = 'none';
        return;
    }

    let total = 0;
    let html = `<table>
        <thead>
            <tr><th>Product</th><th>Price</th><th>Quantity</th><th>Subtotal</th><th>Action</th></tr>
        </thead>
        <tbody>`;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        html += `
            <tr>
                <td>${item.name}</td>
                <td>₹${item.price}</td>
                <td>
                    <button class="btn btn-secondary" onclick="changeQuantity('${item._id}', -1)">-</button>
                    ${item.quantity}
                    <button class="btn btn-secondary" onclick="changeQuantity('${item._id}', 1)">+</button>
                </td>
                <td>₹${subtotal}</td>
                <td><button class="btn btn-danger" onclick="removeFromCart('${item._id}')">Remove</button></td>
            </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
    document.getElementById('cartTotal').innerText = total;
    summary.style.display = 'flex';
}

function changeQuantity(id, delta) {
    const item = cart.find(i => i._id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i._id !== id);
    }
    updateCartCount();
    renderCart();
}

function removeFromCart(id) {
    cart = cart.filter(i => i._id !== id);
    updateCartCount();
    renderCart();
}

// 3. Payment System & Checkout
function openPaymentModal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('payAmount').innerText = total;
    document.getElementById('paymentModal').style.display = 'flex';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

async function confirmPayment() {
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const paymentMethod = document.getElementById('payMethod').value;

    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart, totalAmount, paymentMethod })
        });
        const data = await res.json();

        if (data.success) {
            alert('Payment Successful! Order placed.');
            cart = [];
            updateCartCount();
            closePaymentModal();
            showTab('orders');
        } else {
            alert(data.message || 'Payment failed.');
        }
    } catch (err) {
        alert('Payment processing error.');
    }
}

// 4. Showcase Orders
async function loadOrders() {
    const container = document.getElementById('orderList');
    try {
        const res = await fetch(`${API_URL}/orders`);
        const data = await res.json();
        const orders = data.orders || [];

        if (orders.length === 0) {
            container.innerHTML = '<p>No orders placed yet.</p>';
            return;
        }

        container.innerHTML = orders.map(o => `
            <div class="order-card">
                <h4>Order #${o._id}</h4>
                <p>Date: ${new Date(o.createdAt).toLocaleString()}</p>
                <p>Payment: <strong>${o.paymentMethod}</strong> - <span class="badge-success">${o.paymentStatus}</span></p>
                <p>Items: ${o.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</p>
                <h3>Total Paid: ₹${o.totalAmount}</h3>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = '<p style="color:red;">Error fetching orders.</p>';
    }
}

// 5. Seller Master Panel: Add, Edit, Delete Products
function renderSellerTable() {
    const tbody = document.getElementById('sellerTableBody');
    tbody.innerHTML = products.map(p => `
        <tr>
            <td><strong>${p.name}</strong></td>
            <td>₹${p.price}</td>
            <td>${p.description}</td>
            <td>
                <button class="btn btn-warning" onclick="editProduct('${p._id}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteProduct('${p._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function handleSellerSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('editProductId').value;
    const name = document.getElementById('pName').value.trim();
    const price = Number(document.getElementById('pPrice').value);
    const description = document.getElementById('pDesc').value.trim();

    const payload = { name, price, description };

    try {
        const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
            alert(data.message);
            resetSellerForm();
            loadProducts();
        } else {
            alert(data.message || 'Operation failed');
        }
    } catch (err) {
        alert('Server error occurred.');
    }
}

function editProduct(id) {
    const product = products.find(p => p._id === id);
    if (!product) return;

    document.getElementById('editProductId').value = product._id;
    document.getElementById('pName').value = product.name;
    document.getElementById('pPrice').value = product.price;
    document.getElementById('pDesc').value = product.description;

    document.getElementById('formTitle').innerText = 'Edit Product';
    document.getElementById('saveBtn').innerText = 'Update Product';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';
}

function resetSellerForm() {
    document.getElementById('sellerForm').reset();
    document.getElementById('editProductId').value = '';
    document.getElementById('formTitle').innerText = 'Add New Product';
    document.getElementById('saveBtn').innerText = 'Save Product';
    document.getElementById('cancelEditBtn').style.display = 'none';
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            alert(data.message);
            loadProducts();
        }
    } catch (err) {
        alert('Failed to delete product.');
    }
}

// Initial load
loadProducts();
