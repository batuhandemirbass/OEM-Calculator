const api_key = "8482aabf21c6392007f3504e";
const url = "https://v6.exchangerate-api.com/v6/" + api_key ;

// Storage Controller
const StorageController = (function () {

  return{
    storeProduct : function (product) {
      let products;
      if (localStorage.getItem('products') === null){
         products = [];
         products.push(product);
      }else {
         products = JSON.parse(localStorage.getItem('products'));
         products.push(product);
      }
      localStorage.setItem('products',JSON.stringify(products));
    },
    getProducts : function () {
      let products;
      if (localStorage.getItem('products') === null){
        products = [];
      }else{
        products = JSON.parse(localStorage.getItem('products'));
      }
      return products;
    },
    updateProduct : function (product) {
      let products = JSON.parse(localStorage.getItem('products'));
      products.forEach(function (prd,index) {
        if (product.id == prd.id){
          products.splice(index,1,product);
        }
      });
      localStorage.setItem('products',JSON.stringify(products));
    },
    deleteProduct : function (id){
      let products = JSON.parse(localStorage.getItem('products'));
      products.forEach(function (prd,index) {
        if (id == prd.id){
          products.splice(index,1);
        }
      });
      localStorage.setItem('products',JSON.stringify(products));
    }
  }
})();
// Product Controller
const ProductController = (function () {
//private
  const Product = function (id,name,price) {
    this.id = id;
    this.name = name;
    this.price = price;
  }
  const data = {
    products : StorageController.getProducts(),
    selectedProduct:null,
    totalPrice:0
  }
  //public
 return {
   getProducts: function (){
     return data.products;
   },
   getData : function () {
    return  data;
   },
   getProdcutsById : function (id) {
     let product = null;
     data.products.forEach(function (prd) {
       if (prd.id == id){
         product = prd;
       }
     })
     return product;
   },
   setCurrentProduct : function (product) {
     data.selectedProduct = product;
   },
   getCurrentProduct : function () {
     return data.selectedProduct;
   },
   addProduct : function (name,price) {
     let id;
     if (data.products.length>0){
       id = data.products[data.products.length-1].id+1;
     }else{
       id = 1;
     }
     const newProduct = new Product(id,name,parseFloat(price));
     data.products.push(newProduct);
     return newProduct;
   },
   updateProduct : function (name,price) {
     let product = null;
     data.products.forEach(function (prd) {
       if (prd.id == data.selectedProduct.id){
         prd.name = name;
         prd.price = parseFloat(price);
         product = prd
       }
     });
     return product
   },
   deleteProduct : function (product){
     data.products.forEach(function (prd,index) {
       if (prd.id == product.id){
         data.products.splice(index,1);
       }
     })
   },
   getTotal : function () {
     let  total = 0;
     data.products.forEach(function(item) {
       total+=item.price;
     });
     data.totalPrice = total;
     return data.totalPrice;
   }
 }
})();
// UI Controller
const UIController = (function () {

  const Selectors = {
    productList : "item-list",
    productListItems:"#item-list tr",
    addButton : 'addBtn',
    editButton : 'editBtn',
    deleteButton :'deleteBtn',
    cancelButton : 'cancelBtn',
    productName : 'product-name',
    productPrice : 'product-price',
    productCard : 'product-card',
    totalTL:'total-tl',
    totalDollar:'total-dollar'
  }
  return{
    createProductList : function (products) {
      let html = '';
      products.forEach(prd => {
        html+=`
          <tr>
          <td>${prd.id}</td>
          <td>${prd.name}</td>
          <td>${prd.price} $</td>
          <td class="text-end">
            <i class="fa fa-edit px-1 edit-product"></i>Edit
          </td>
        </tr>
        `;
      });
      document.getElementById(Selectors.productList).innerHTML = html;
      console.log(products);
    },
    getSelectors : function () {
      return Selectors;

    },
    addProduct : function (prd) {
      document.getElementById(Selectors.productCard).style.display = 'block';
      var item = ` <tr>
          <td>${prd.id}</td>
          <td>${prd.name}</td>
          <td>${prd.price} $</td>
          <td class="text-end">
            <i class="fa fa-edit px-1 edit-product"></i>Edit
          </td>
        </tr>`;
      document.getElementById(Selectors.productList).innerHTML+= item;
    },
    clearInputs : function () {
      document.getElementById(Selectors.productName).value = '';
      document.getElementById(Selectors.productPrice).value = '';
    },
    hideCard : function () {
     document.getElementById(Selectors.productCard).style.display = 'none';
    },
    showTotal : function (total) {
      !async function(){
        let datas = await fetch(url+"/latest/USD")
          .then((response) => response.json())
          .then(data => {
            const datas = data.conversion_rates.TRY;
            return datas;
          })
          .catch(error => {
            console.error(error);
          });
        document.getElementById(Selectors.totalDollar).textContent = total;
        document.getElementById(Selectors.totalTL).textContent = Math.floor(total * datas);
      }();
    },
    addProductToForm : function () {
      const  selectedProduct = ProductController.getCurrentProduct();
      document.getElementById(Selectors.productName).value = selectedProduct.name;
      document.getElementById(Selectors.productPrice).value = selectedProduct.price;

    },
    clearWarnings : function (){
      const items = document.querySelectorAll(UIController.productListItems);
      items.forEach(function (item) {
        if (item.classList.contains('bg-warning')){
          item.classList.remove('bg-warning');
        }
      });
    },
    addingState : function (item) {
      UIController.clearWarnings();
      UIController.clearInputs();
      document.getElementById(Selectors.addButton).style.display = 'inline';
      document.getElementById(Selectors.editButton).style.display = 'none';
      document.getElementById(Selectors.deleteButton).style.display = 'none';
      document.getElementById(Selectors.cancelButton).style.display = 'none';
    },
    editState : function (tr) {
      const parent = tr.parentNode;
      console.log(parent.children.length);
      for (let i=0;i<parent.children.length;i++){
        parent.children[i].classList.remove('bg-warning');
      }
      tr.classList.add('bg-warning');
      document.getElementById(Selectors.addButton).style.display = 'none';
      document.getElementById(Selectors.editButton).style.display = 'inline';
      document.getElementById(Selectors.deleteButton).style.display = 'inline';
      document.getElementById(Selectors.cancelButton).style.display = 'inline';
    },
    updateProduct : function (prd) {
       let updatedItem = null;
       let items = document.querySelectorAll(Selectors.productListItems);
       items.forEach(function (item) {
         if (item.classList.contains('bg-warning')){
           item.children[1].textContent = prd.name;
           item.children[2].textContent = prd.price + '$';
           updatedItem = item;
         }
       })
       return updatedItem
    },
    deleteProduct : function () {
      let items = document.querySelectorAll(Selectors.productListItems);
      items.forEach(function (item) {
        if (item.classList.contains('bg-warning')){
           item.remove();
        }
      });
    }
  }

})();
// App Controller
const AppController = (function (ProductCtrl,UICtrl,StorageCtrl) {

  const UISelectors = UIController.getSelectors();

  // Load Event Listeners
  const loadEventListeners = function () {

    // add product event
    document.getElementById(UISelectors.addButton).addEventListener('click', productAddSubmit);

    // edit product event clicked
    document.getElementById(UISelectors.productList).addEventListener('click',productEditClicked);

    // edit product submit
    document.getElementById(UISelectors.editButton).addEventListener('click',editProductSubmit);

    //cancel button clicked
    document.getElementById(UISelectors.cancelButton).addEventListener('click',cancelUpdate);

    //delete button
    document.getElementById(UISelectors.deleteButton).addEventListener('click',deleteProduct);
  }

  const productAddSubmit = function (e) {

    const productName = document.getElementById(UISelectors.productName).value;
    const productPrice = document.getElementById(UISelectors.productPrice).value;

    if (productName !== '' && productPrice !== '') {
      // Add product
      const newProduct = ProductCtrl.addProduct(productName, productPrice);

      // add item to list
      UICtrl.addProduct(newProduct);

      //product add local storage
       StorageCtrl.storeProduct(newProduct);
      //get total
      const total = ProductCtrl.getTotal();

      //show total
      UICtrl.showTotal(total);

      // Update Local Storage

      StorageController.updateProduct(updatedProduct);
      // clear inputs
      UICtrl.clearInputs();

    }

    console.log(productName, productPrice);

    e.preventDefault();
  }

  const productEditClicked = function (e) {
    if(e.target.classList.contains('edit-product')){
      const id = e.target.parentNode.previousElementSibling.previousElementSibling.previousElementSibling.textContent;

      //get selected product
      const product = ProductCtrl.getProdcutsById(id);

      //set current product
      ProductCtrl.setCurrentProduct(product);

      //add product to UI
      UICtrl.addProductToForm();

      //edit state
      UICtrl.editState(e.target.parentNode.parentNode);
    }
    e.preventDefault();
  }

  const editProductSubmit = function (e) {
    const productName = document.getElementById(UISelectors.productName).value;
    const productPrice = document.getElementById(UISelectors.productPrice).value;1
    if (productName !== '' && productPrice !=='' ){
      //update product
      const updatedProduct = ProductCtrl.updateProduct(productName,productPrice);

      //update ui
      let item = UICtrl.updateProduct(updatedProduct);

      //get total
      const total = ProductCtrl.getTotal();

      //show total
      UICtrl.showTotal(total);

      UICtrl.editState();

    }
    e.preventDefault();
  }

  const cancelUpdate = function (e) {

    UICtrl.addingState();
    UICtrl.clearWarnings();
    e.preventDefault();
  }

  const deleteProduct = function (e) {
    //get selected product
    const selectedProduct = ProductCtrl.getCurrentProduct();
    //delete product
    ProductCtrl.deleteProduct(selectedProduct);
    //delete UI
    UICtrl.deleteProduct();

    //get total
    const total = ProductCtrl.getTotal();

    //show total
    UICtrl.showTotal(total);

    //delete from Storage
    StorageCtrl.deleteProduct(selectedProduct.id);

    UICtrl.addingState();

    if(total == 0 ){
      UICtrl.hideCard();
    }

    e.preventDefault();
  }

  return{
    init : function (){
      console.log("starting app");
      UICtrl.addingState();
      const products = ProductCtrl.getProducts();
      if (products.length === 0){
        UICtrl.hideCard();
      }else{
        UICtrl.createProductList(products);
      }
      loadEventListeners();
    }
  }

})(ProductController,UIController,StorageController);

AppController.init();

