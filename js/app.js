let drinkNames = ["Thai Tea", "Green Thai Tea", "Raven Brew", "Teto Soda"];
let drinkAmounts = [10, 20, 30, 40];
// All cost $4

let foodNames = ["Plain Onigiri", "Chicken Onigiri", "Chocolate Chip Cookie", "Caramel Cheesecake", "Pumpkin Roll", "FNAF Cupcake", "Butcher Rice Krispy"];
let foodAmounts = [1, 1, 1, 1, 1, 41, 1];
let foodCosts = [3, 4, 2, 5, 5, 5, 3];

const DC = document.getElementById("drinkContainer");
const FC = document.getElementById("foodContainer");
const currDrinks = document.getElementById("currDrinks");
const currFood = document.getElementById("currFood");
const orderB = document.getElementById("orderButton");
const blurBG = document.getElementById("blur");
const confirmC = document.getElementById("confirmCont");
const sendB = document.getElementById("sendOrder");
const cancelB = document.getElementById("cancelOrder");
const table = document.getElementById("tableNum");
const totalDisplay = document.getElementById("totalPrice");
const logo = document.getElementById("logo");

// Instances that get deleted/overwritten
let orderNumElement = null;
let dList = null;
let fList = null;

// Current order information
let drinkOrder = [];
let foodOrder = [];
let currCost = 0;
let orderNum = 1;
let hiddenOrder = [];

// Link to the Google Sheet:
const spreadsheet = "https://script.google.com/macros/s/AKfycbyr4mlzOvSNZPem9D-8QDCWWXyiFdDRMY7kr_AvH7NsQN54Z-4TgRRbvqxc_ftP93zl/exec";

// Loads initial stock
async function loadStock() {
    try {
        const data = await fetch(spreadsheet);
        const rows = await data.json();
        const stock = {};
        rows.slice(1).forEach(([name, amount]) => stock[name] = Number(amount));

        drinkNames.forEach((n, i) => { if (n in stock) drinkAmounts[i] = stock[n]; });
        foodNames.forEach((n, i) => { if (n in stock) foodAmounts[i] = stock[n]; });
    } catch (e) {
        console.error(e);
    }
    reload();
}

// Saves new stock back to the spreadsheet
function saveStock() {
    const rows = [...drinkNames.map((n, i) => [n, drinkAmounts[i]]), ...foodNames.map((n, i) => [n, foodAmounts[i]])];
    fetch(spreadsheet, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({action: "setStock", rows: rows })
    }).catch(console.error);
}

// I don't know why I called it this, it's the add to order button
function remStock(currID, isDrink) {
    if (isDrink == true) {

        // Removes from stock, adds to the drink orders
        drinkAmounts[currID]--;
        if (drinkOrder.length == 0) {
            drinkOrder.push(drinkNames[currID]);
        }
        else {
            drinkOrder.push(" " + drinkNames[currID]);
        }
        currCost += 4;  // All drinks cost $4 (Fall 26)

        // Add to the visible menu
        let drink = document.createElement("li");
        let item = document.createElement("span");
        let button = document.createElement("button");
        item.textContent = " " + drinkNames[currID] + " ";
        button.innerText = "X";
        button.classList.add("addButton");
        drink.appendChild(button);
        drink.appendChild(item);
        button.onclick = () => delItem(button.parentElement, drinkNames[currID], true);
        currDrinks.appendChild(drink);
    }
    else {

        // Removes from stock, adds to the food orders
        foodAmounts[currID]--;
        if (foodOrder.length == 0) {
            foodOrder.push(foodNames[currID]);
        }
        else {
            foodOrder.push(" " + foodNames[currID]);
        }
        currCost += foodCosts[currID];

        // Add to the visible menu
        let food = document.createElement("li");
        let item = document.createElement("span");
        let button = document.createElement("button");
        item.textContent = " " + foodNames[currID] + " ";
        button.innerText = "X";
        button.classList.add("addButton");
        food.appendChild(button);
        food.appendChild(item);
        button.onclick = () => delItem(button.parentElement, foodNames[currID], false);
        currFood.appendChild(food);
    }
    reload()
}

function delItem(parent, item, isDrink) {
    parent.remove()
    if (isDrink) {
        currCost -= 4;
        oopsReAdd(drinkNames.indexOf(item), isDrink, true);
        index = drinkOrder.indexOf(item);
        drinkOrder.splice(index, 1);
    }
    else {
        currCost -= foodCosts[foodNames.indexOf(item)];
        oopsReAdd(foodNames.indexOf(item), isDrink, true);
        index = foodOrder.indexOf(item);
        foodOrder.splice(index, 1);
    }
}

function oopsReAdd(currID, isDrink, menuScreen) {
    if (isDrink == true) {
        drinkAmounts[currID]++;
    }
    else {
        foodAmounts[currID]++;
    }
    if (menuScreen == true) {
        reload();
    }
    saveStock();
}

function reload() {
    // OK so I could make this simpler but I don't care right now
    DC.innerHTML = ``
    FC.innerHTML = ``

    // (Re)loads the drinks
    for (let i = 0; i < 4; i++) {
        if (drinkAmounts[i] > 0) {
            DC.innerHTML += `<div class="menuItem">
            <h2>${drinkNames[i]}</h2>
            <p>Price: $4</p>
            <h3>STOCK: ${drinkAmounts[i]}</h3>
            <button class="addButton" id="${i}" onclick="remStock(this.id, true)"> Add to order </button>
            </div>`
            // Removed             <button class="plusButton" id="${i}" onclick="oopsReAdd(this.id, true, true)"> (add stock) </button>
        }
        else {
            DC.innerHTML += `<div class="menuItem">
            <h2>${drinkNames[i]}</h2>
            <h3><b>OUT OF STOCK</b></h3=>
            </div>`
            // Removed             <button class="plusButton" id="${i}" onclick="oopsReAdd(this.id, true, true)"> (add stock) </button>
        }
    }

    // (Re)loads the foods
    for (let i = 0; i < 7; i++) {
        if (foodAmounts[i] > 0) {
            FC.innerHTML += `<div class="menuItem">
            <h2>${foodNames[i]}</h2>
            <p>Price: $${foodCosts[i]}</p>
            <h3>STOCK: ${foodAmounts[i]}</h3=>
            <button class="addButton" id="${i}" onclick="remStock(this.id, false)"> Add to order </button>
            </div>`
            // Removed             <button class="plusButton" id="${i}" onclick="oopsReAdd(this.id, false, true)"> (add stock) </button>
        }
        else {
            FC.innerHTML += `<div class="menuItem">
            <h2>${foodNames[i]}</h2>
            <h3><b>OUT OF STOCK<b></h3=>
            </div>`
            // Removed             <button class="plusButton" id="${i}" onclick="oopsReAdd(this.id, false, true)"> (add stock) </button>

        }
    }
}

function order() {
    sendB.style.display = "inline-block";
    cancelB.style.display = "inline-block";
    blurBG.style.zIndex = "1";
    confirmC.style.display = "block";
    logo.style.display = "block";

    // For the confirmation:
    orderNumElement = document.createElement("div");
    orderNumElement.innerText = "Order #" + orderNum;
    dList = document.createElement("ul");
    dList.innerText = "Drinks:";
    fList = document.createElement("ul");
    fList.innerText = "Food:";
    
    // In this order so it goes:
    // orderNum -> drinks -> food
    confirmC.prepend(fList);
    confirmC.prepend(dList);
    confirmC.prepend(orderNumElement);

    // Only iterating over the drink/food items:
    for (let i = 0; i < drinkOrder.length; i++) {
        let newElement = document.createElement("li");
        let item = document.createElement("span");
        let price = document.createElement("span");
        let row = document.createElement("div");
        row.classList.add("spacedRow");
        row.appendChild(item);
        row.appendChild(price);
        newElement.appendChild(row);
        item.innerText = drinkOrder[i].trim();
        price.innerText = "$4";
        dList.appendChild(newElement);
    }
    for (let i = 0; i < foodOrder.length; i++) {
        let newElement = document.createElement("li");
        let item = document.createElement("span");
        let price = document.createElement("span");
        let row = document.createElement("div");
        row.classList.add("spacedRow");
        row.appendChild(item);
        row.appendChild(price);
        newElement.appendChild(row);
        item.innerText = foodOrder[i].trim();
        price.innerText = "$" + foodCosts[foodNames.indexOf(foodOrder[i].trim())];
        fList.appendChild(newElement);
    }
    totalDisplay.textContent = "$" + currCost;
}

function cancel() {

    // Add back to stock ehe but I'll do that later
    for (let i = 0; i < drinkOrder.length; i++) {
        let index = drinkNames.indexOf(drinkOrder[i].trim());
        oopsReAdd(index, true, false);
    }
    for (let i = 0; i < foodOrder.length; i++) {
        let index = foodNames.indexOf(foodOrder[i].trim());
        oopsReAdd(index, false, false);
    }

    // Reset lists/cost
    drinkOrder = [];
    foodOrder = [];
    currCost = 0;

    // Reset display
    closeOrder()
    
    // Current menu on screen reset
    currDrinks.innerHTML = `Drinks:`;
    currFood.innerHTML = `Foods:`;

    // Reloads to update stock count
    reload()
}

// Spreadsheet sending function
async function orderToSpreadsheet() {
    // Reset all info as we send off info
    hiddenOrder = [orderNum, table.value, drinkOrder, foodOrder, currCost];
    drinkOrder = [];
    foodOrder = [];
    table.innerText = "";
    currCost = 0;
    orderNum++;
    console.log(hiddenOrder);
    
    // Sends to the spreadsheet based on hiddenOrder 
    // (for formatting reasons)
    const order = hiddenOrder;
    console.log(order);
    try {
        await fetch(spreadsheet, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify({order: order})
        });
        saveStock();
        alert("Order sent successfully!");
    }
    catch (e) {
        alert("Error: ", e);
    }

    sendB.style.display = "none";
    cancelB.style.display = "none";
    blurBG.style.zIndex = "-1";
    confirmC.style.display = "none";
    logo.style.display = "none";

    orderNumElement.remove();
    dList.remove();
    fList.remove();

    // Current menu on screen reset
    currDrinks.innerHTML = `Drinks:`;   // So if we expand this in the future
    currFood.innerHTML = `Foods:`;      // We should *proooobably* make it safer
}

// Zoo of random functions

// Ensures table number is 1-20
table.addEventListener("change", () => {
    let val = parseInt(table.value, 10);
    if (isNaN(val)) {
        table.value = "";
    } else {
        table.value = Math.min(20, Math.max(1, val));
    }
});

document.addEventListener("keydown", (event) => {

    // Press escape to exit the chudddie order menu
    if (event.key === "Escape") {
        closeOrder();
    }
});

// Goes back to the original screen
function closeOrder() {
    // Reset display
    sendB.style.display = "none";
    cancelB.style.display = "none";
    blurBG.style.zIndex = "-1";
    confirmC.style.display = "none";
    logo.style.display = "none";

    orderNumElement.remove();
    dList.remove();
    fList.remove();
}

// FINAL CHANGES
// ADD STOCK DEPENDENCIES FROM FROM A SEPARATE FILE

loadStock()