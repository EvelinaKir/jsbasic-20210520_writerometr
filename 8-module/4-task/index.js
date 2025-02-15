import createElement from '../../assets/lib/create-element.js';
import escapeHtml from '../../assets/lib/escape-html.js';

import Modal from '../../7-module/2-task/index.js';

export default class Cart {
  cartItems = []; // [product: {...}, count: N]

  constructor(cartIcon) {
    this.cartIcon = cartIcon;

    this.addEventListeners();
  }

  addProduct(product) {
    if (!product || product == null) {
      return;
    }
    let exist = this.cartItems.find(el => el.product.id === product.id);
		let newItem;
		if (!exist) {
			newItem = {
				product: product,
				count: 1,
			}
			this.cartItems.push(newItem);
		} else {
			exist.count++;
		}
		this.onProductUpdate(newItem);
  }

  updateProductCount(productId, amount) {
    let exist = this.cartItems.find(el => el.product.id == productId);

		if (exist && exist.count > 0) {
			exist.count += amount;
		}
		if (exist.count === 0) {
			this.cartItems.splice(this.cartItems.indexOf(exist), 1);
		}

		this.onProductUpdate(exist);
  }

  isEmpty() {
    if (this.cartItems.length === 0) {
      return true;
    } 
    else {
      return false;
    }
  }

  getTotalCount() {
    let res = this.cartItems.map(item => item.count).reduce((total, current) => total + current, 0);
     return res;
  }

  getTotalPrice() {
    let res = this.cartItems.reduce((total, current) => total + current.product.price * current.count, 0);
      return res;
  }

  renderProduct(product, count) {
    return createElement(`
    <div class="cart-product" data-product-id="${
      product.id
    }">
      <div class="cart-product__img">
        <img src="/assets/images/products/${product.image}" alt="product">
      </div>
      <div class="cart-product__info">
        <div class="cart-product__title">${escapeHtml(product.name)}</div>
        <div class="cart-product__price-wrap">
          <div class="cart-counter">
            <button type="button" class="cart-counter__button cart-counter__button_minus">
              <img src="/assets/images/icons/square-minus-icon.svg" alt="minus">
            </button>
            <span class="cart-counter__count">${count}</span>
            <button type="button" class="cart-counter__button cart-counter__button_plus">
              <img src="/assets/images/icons/square-plus-icon.svg" alt="plus">
            </button>
          </div>
          <div class="cart-product__price">€${(product.price * count).toFixed(2)}</div>
        </div>
      </div>
    </div>`);
  }

  renderOrderForm() {
    return createElement(`<form class="cart-form">
      <h5 class="cart-form__title">Delivery</h5>
      <div class="cart-form__group cart-form__group_row">
        <input name="name" type="text" class="cart-form__input" placeholder="Name" required value="Santa Claus">
        <input name="email" type="email" class="cart-form__input" placeholder="Email" required value="john@gmail.com">
        <input name="tel" type="tel" class="cart-form__input" placeholder="Phone" required value="+1234567">
      </div>
      <div class="cart-form__group">
        <input name="address" type="text" class="cart-form__input" placeholder="Address" required value="North, Lapland, Snow Home">
      </div>
      <div class="cart-buttons">
        <div class="cart-buttons__buttons btn-group">
          <div class="cart-buttons__info">
            <span class="cart-buttons__info-text">total</span>
            <span class="cart-buttons__info-price">€${this.getTotalPrice().toFixed(
              2
            )}</span>
          </div>
          <button type="submit" class="cart-buttons__button btn-group__button button">order</button>
        </div>
      </div>
    </form>`);
  }

  renderModal() {
     let modal = new Modal();
     modal.setTitle('Your order');
     let res = document.createElement('div');
     this.cartItems.forEach(item => {
        let elem = res.appendChild(this.renderProduct(item.product, item.count))
        let plus = elem.querySelector('.cart-counter__button_plus')
        plus.addEventListener('click', () => this.updateProductCount(item.product.id, 1));
        let minus = elem.querySelector('.cart-counter__button_minus')
        minus.addEventListener('click', () => this.updateProductCount(item.product.id, -1));
     });
     res.appendChild(this.renderOrderForm());
     modal.setBody(res); 
     modal.open();
     
     document.querySelector("form").onsubmit = (event) => this.onSubmit(event);
  
}

  onProductUpdate(cartItem) {
    // ...ваш код
    
    if (document.querySelector('body').classList.contains('is-modal-open')){
     let productId = cartItem.product.id;
     let modalBody = document.querySelector('.modal__body');
     let productCount = modalBody.querySelector(`[data-product-id="${productId}"] .cart-counter__count`);
     let productPrice = modalBody.querySelector(`[data-product-id="${productId}"] .cart-product__price`);
     let infoPrice = modalBody.querySelector(`.cart-buttons__info-price`);
     productCount.innerHTML = cartItem.count;
     productPrice.innerHTML = `€${(cartItem.product.price * cartItem.count).toFixed(2)}`;
     infoPrice.innerHTML = `€${this.getTotalPrice().toFixed(2)}`;
    }
    this.cartIcon.update(this);
    if (this.isEmpty()) {
      let modal = new Modal();
      modal.close();
    }
  }

   onSubmit(event) {
    event.preventDefault();
    let submit = document.querySelector('button[type="submit"]');
    submit.classList.add('is-loading');
    let form = document.querySelector('.cart-form');
      fetch ('https://httpbin.org/post', {
        method: "POST",
        body: new FormData(form)
      })
      .then(response => {
        if (response.ok) {
    this.cartItems = [];
    submit.classList.remove('is-loading');
    document.querySelector('.modal__title').textContent = 'Success!';
    this.cartIcon.update(this);
    document.querySelector('.modal__body').innerHTML = `
    <div class="modal__body-inner">
  <p>
    Order successful! Your order is being cooked :) <br>
    We’ll notify you about delivery time shortly.<br>
    <img src="/assets/images/delivery.gif">
  </p>
</div>
    `
  }    
});
}
  addEventListeners() {
    this.cartIcon.elem.onclick = () => this.renderModal();
  }
}

