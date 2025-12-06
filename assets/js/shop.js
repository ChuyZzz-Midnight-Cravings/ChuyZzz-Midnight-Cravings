const PRODUCTS = [
  // CHIPS
  {id:'c1',name:'Midnight Caramel Crumble',price:145,img:'assets/images/chips/caramel-cramble.png', category:'chips'},
  {id:'c2',name:'Moonight Cookie Essence',price:155,img:'assets/images/chips/cookie-essence.png', category:'chips'},
  {id:'c3',name:'Dark Nebula Cocoa',price:150,img:'assets/images/chips/nebula-cocoa.png', category:'chips'},
  {id:'c4',name:'Lunar Choco Drizzle',price:155,img:'assets/images/chips/chooco-drizzle.png', category:'chips'},
  {id:'c5',name:'Ruffles Flamin Hot',price:35,img:'assets/images/chips/ruffles.png', category:'chips'},
  {id:'c6',name:'Lays Classic',price:85,img:'assets/images/chips/lays.png', category:'chips'},
  {id:'c7',name:'Piattos Cheese',price:40,img:'assets/images/chips/piattos-cheese.png', category:'chips'},
  {id:'c8',name:'Piattos Nacho Pizza',price:45,img:'assets/images/chips/piattos-pizza.png', category:'chips'},
  {id:'c9',name:'Piattos Sour Cream & Onion',price:45,img:'assets/images/chips/piattos-sco.png', category:'chips'},

  // DRINKS
  {id:'d1',name:'Coke-in-a-Can',price:45,img:'assets/images/drinks/coke.png', category:'drinks'},
  {id:'d2',name:'Sprite-in-a-Can',price:45,img:'assets/images/drinks/sprite.png', category:'drinks'},
  {id:'d3',name:'Royal-in-a-Can',price:88,img:'assets/images/drinks/royal.png', category:'drinks'},
  {id:'d4',name:'Grape Royal',price:85,img:'assets/images/drinks/royal-grape.png', category:'drinks'},
  {id:'d5',name:'Pepsi-in-a-Can',price:85,img:'assets/images/drinks/pepsi.png', category:'drinks'},

  // FOODS
  {id:'f1', name:'Burger', price:120, img:'assets/images/Foods/buerger.jpg', category:'foods'},
  {id:'f2', name:'Fried Chicken', price:150, img:'assets/images/Foods/chekin joy.jpg', category:'foods'},
  {id:'f3', name:'Fries', price:70, img:'assets/images/Foods/fries.jpg', category:'foods'},
  {id:'f4', name:'Halo Halo', price:60, img:'assets/images/Foods/halo2.jpg', category:'foods'},
  {id:'f5', name:'Pizza Cheese', price:180, img:'assets/images/Foods/pitza cheez.jpg', category:'foods'},
  {id:'f6', name:'Spaghetti', price:130, img:'assets/images/Foods/spag.jpg', category:'foods'}, 
  {id:'f7', name:'Shawarma', price:75, img:'assets/images/Foods/sawarma.jpg', category:'foods'},    
  {id:'f8', name:'Siomai', price:130, img:'assets/images/Foods/soimai.jpg', category:'foods'},
  {id:'f9', name:'Siopao', price:130, img:'assets/images/Foods/sopaw.jpg', category:'foods'},      

];

function renderShop(){
  const chipsContainer = document.getElementById('chips-list');
  const drinksContainer = document.getElementById('drinks-list');
  const foodsContainer = document.getElementById('foods-list');

  if(!chipsContainer || !drinksContainer || !foodsContainer) return;

  PRODUCTS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>₱${p.price}</p>
      <button class="btn" onclick="addToCart('${p.id}')">Add to Cart</button>
    `;

    if(p.category === 'chips') chipsContainer.appendChild(card);
    if(p.category === 'drinks') drinksContainer.appendChild(card);
    if(p.category === 'foods') foodsContainer.appendChild(card);
  });
}

function addToCart(id){
  const p = PRODUCTS.find(x => x.id === id);
  if(!p) return;

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const found = cart.find(i => i.id === id);

  if(found) {
    found.quantity += 1;
  } else {
    cart.push({id:p.id, name:p.name, price:p.price, image:p.img, quantity:1});
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  alert(p.name + ' added to cart');
}

window.addEventListener('DOMContentLoaded', renderShop);
window.addEventListener('DOMContentLoaded', updateCartCount);