////////////////////////////////////////
///// Module & Module Pattern
////////////////////////////////////////

// BUDGET Controller
let budgetController = (function() {
  let Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };


  Expense.prototype.calcPercentage = function(totalIncome) {
    if(totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    }
    else {
      this.percentage = -1;
    }

  };


  Expense.prototype.getPercentage = function() {
    return this.percentage;
  }


  let Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };


  let data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  calculateTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach(function(current) {
      sum += current.value;
    });

    data.totals[type] = sum;
  };

  return {

    addItem: function(type, des, val) {
      let newItem, ID;

      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      // Create new item based on 'inc' or 'exp' type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if ((type = "inc")) {
        newItem = new Income(ID, des, val);
      }

      // Push it into our data structure
      data.allItems[type].push(newItem);
      // Return the new element
      return newItem;
    },


    deleteItem: function(type, id) {
      let index, ids;

      //index = data.allItems[type][id];

      ids = data.allItems[type].map(function(current) {
      return current.id;
      });

      index = ids.indexOf(id);

      if(index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },


    calculateBudget: function() {
      // Calculate total income & expenses
      calculateTotal("inc");
      calculateTotal("exp");

      // Calculate the budget = income - expense
      data.budget = data.totals.inc - data.totals.exp;

      if (data.totals.inc > 0) {
        // Calculate the percentage of expense
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },


    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },


    calculatePercentages: function() {
      data.allItems.exp.forEach(function(current) {
        current.calcPercentage(data.totals.inc);
      });
    },


    getPercentages: function() {
      let allPercentages = data.allItems.exp.map(function(current) {
        return current.getPercentage();
      });

      return allPercentages;
    },

    test: function() {
      console.log(data);
    }

  }

})();

// UI Controller
let UIController = (function() {
  let DOMname = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLable: ".budget__expenses--value",
    percentageLable: ".budget__expenses--percentage",
    container: ".container",
    expPercentageLable: ".item__percentage",
    dateLabel: ".budget__title--month"

  };

  let formatNumber = function(num, type) {
    let int, dec, numString, sign;
    /*
    59671.9754 -> + 59,671.97 
    2000 -> + 2,000.00
    */
    num = Math.abs(num);
    // 1. exactly 2 decimal point 
    num = num.toFixed(2);

    // 2. comma separate the thousand
    numString = num.split(".");
    int = numString[0];
    dec = numString[1];

    if(int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }

    // 3. + or - befor the numbers
    type === "inc" ? sign = "+" : sign = "-";

    return sign + " " + int + "." + dec;
  };


  let nodeListForEach = function(nodeList, callback) {
    for(let i = 0; i < nodeList.length; i++) {
      callback(nodeList[i], i);
    }
  };


  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMname.inputType).value,
        description: document.querySelector(DOMname.inputDescription).value,
        value: parseFloat(document.querySelector(DOMname.inputValue).value)
      };
    },

    getDOMname: function() {
      return DOMname;
    },

    addListItem: function(obj, type) {
      let html, newHtml, element;

      // Create HTML string with placeholder text
      if (type === "inc") {
        element = DOMname.incomeContainer;

        html =
          '<div class="item clearfix" id="inc-#id#"><div class="item__description">#description#</div><div class="right clearfix"><div class="item__value">#value#</div><div class="item__delete"><button class="item__delete--btn"><ion-icon name="ios-close-circle-outline"></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMname.expenseContainer;

        html =
          '<div class="item clearfix" id="exp-#id#"><div class="item__description">#description#</div><div class="right clearfix"><div class="item__value">#value#</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><ion-icon name="ios-close-circle-outline"></button></div></div></div>';
      }
      // Replace the placeholder text with some actual data
      newHtml = html.replace("#id#", obj.id);
      newHtml = newHtml.replace("#description#", obj.description);
      newHtml = newHtml.replace("#value#", formatNumber(obj.value, type));
      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },


    deleteListItem: function(setectorID) {
      let element = document.getElementById(setectorID);
      element.parentNode.removeChild(element);
    },


    clearFields: function() {
      let fields, fieldsArray;

      fields = document.querySelectorAll(
        DOMname.inputDescription + ", " + DOMname.inputValue
      );

      fieldsArray = Array.prototype.slice.call(fields);

      fieldsArray.forEach(function(current, index, arraay) {
        current.value = "";
      });

      fieldsArray[0].focus();

      // document.querySelector(DOMname.inputDescription).value = "";
      // document.querySelector(DOMname.inputValue).value = "";
      // document.querySelector(DOMname.inputDescription).focus();
    },


    displayBudget: function(obj) {
      let type;
      obj.budget >= 0 ? type = "inc" : type = "exp";

      document.querySelector(DOMname.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMname.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
      document.querySelector(DOMname.expenseLable).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMname.percentageLable).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMname.percentageLable).textContent = "--";
      }
    },


    displayPercentages: function(percentages) {
      let fields = document.querySelectorAll(DOMname.expPercentageLable);

      nodeListForEach(fields, function(current, index) {
        if(percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        }
        else {
          current.textContent = "--";
        }
      });
    },


    displayDate: function() {
      let now, year, month;
      let months = ["January", "February", "March", "April", "May", "June", "July", "August	", "September", "October", "November", "December"]

      now = new Date();
      month = now.getMonth()
      year = now.getFullYear();

      document.querySelector(DOMname.dateLabel).textContent = months[month] + ", " + year;
    },


    changeType: function() {
      let fields = document.querySelectorAll(DOMname.inputType + "," + DOMname.inputDescription + "," + DOMname.inputValue);

      document.querySelector(DOMname.inputBtn).classList.toggle("red");
      
      nodeListForEach(fields, function(current) {
        current.classList.toggle("red-focus");
      });
    }

  };
})();

// GLOBAL APP Controller
let controller = (function(budgetCtrl, UICtrl) {
  let setupEventListners = function() {
    let DOM = UICtrl.getDOMname();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changeType);
  };

  let updateBudget = function() {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();
    // 2. Return the budget
    let budget = budgetCtrl.getBudget();
    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);
  };


  let updatePercentages = function() {
    // 1. Calculate percentages
    budgetCtrl.calculatePercentages();

    // 2. Read them from the budget controller
    let percentages = budgetCtrl.getPercentages();

    // 3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);

  };


  let ctrlAddItem = function() {
    let input, newItem;

    // 1. Get the input field data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the itme to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      // 4. Clear fiels
      UICtrl.clearFields();

      // 5. Calculate and Update budget
      updateBudget();

      // 6. Update percentages
      updatePercentages();
    }
  };

  let ctrlDeleteItem = function(event) {
    let itemId, splitID, type, ID;

    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemId) {
      splitID = itemId.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete the item from data structure
      budgetCtrl.deleteItem(type, ID);
      // 2. Delete the item from the UI
      UICtrl.deleteListItem(itemId);
      // 3. Update and show the budget
      updateBudget();
      // 4. Update percentages
      updatePercentages();
    }

  };

  return {
    init: function() {
      console.log("Application is started.");
      UICtrl.displayDate();
      setupEventListners();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0
      });
    }
  };
})(budgetController, UIController);

controller.init();
