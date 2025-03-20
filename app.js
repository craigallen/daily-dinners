document.addEventListener('DOMContentLoaded', () => {
    const dinnerForm = document.getElementById('dinner-form');
    const dinnerList = document.getElementById('dinner-list');
    const ingredientDinnerList = document.getElementById('ingredient-dinner-list');
    const ingredientList = document.getElementById('ingredient-list');
    const allDinnersList = document.getElementById('all-dinners-list');
    const ingredientOptions = document.getElementById('ingredient-options');
    const dinners = JSON.parse(localStorage.getItem('dinners')) || [];

    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(button.dataset.tab).classList.add('active');

            if (button.dataset.tab === 'list-dinners') {
                listAllDinners();
            }
        });
    });

    // Set default active tab
    tabButtons[0].classList.add('active');
    tabContents[0].classList.add('active');

    populateIngredientOptions();
    showLastWeekDinners();
    sortAndDisplayDinners();

    dinnerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const dinnerName = document.getElementById('dinner-name').value;
        const dinnerDate = document.getElementById('dinner-date').value;
        const ingredients = document.getElementById('ingredients').value.split(',').map(ing => ing.trim());
        const dinner = { name: dinnerName, date: dinnerDate, ingredients };
        dinners.push(dinner);
        localStorage.setItem('dinners', JSON.stringify(dinners));
        populateIngredientOptions();
        showLastWeekDinners();
        dinnerForm.reset();
        alert('Dinner added successfully!');
    });

    document.getElementById('view-dinners-btn').addEventListener('click', () => {
        const dateRange = document.getElementById('date-range').value;
        const filteredDinners = filterDinnersByDateRange(dinners, dateRange);
        displayDinners(filteredDinners.sort((a, b) => new Date(b.date) - new Date(a.date)), dinnerList, true);
    });

    document.getElementById('search-ingredient-btn').addEventListener('click', () => {
        const ingredient = document.getElementById('ingredient-search').value.trim();
        const filteredDinners = filterDinnersByIngredient(dinners, ingredient);
        displayDinners(filteredDinners, ingredientDinnerList);
    });

    function filterDinnersByDateRange(dinners, range) {
        const now = new Date();
        return dinners.filter(dinner => {
            const dinnerDate = new Date(dinner.date);
            if (range === 'week') {
                const oneWeekAgo = new Date(now);
                oneWeekAgo.setDate(now.getDate() - 7);
                return dinnerDate >= oneWeekAgo && dinnerDate <= now;
            } else if (range === 'month') {
                const oneMonthAgo = new Date(now);
                oneMonthAgo.setMonth(now.getMonth() - 1);
                return dinnerDate >= oneMonthAgo && dinnerDate <= now;
            }
            return false;
        });
    }

    function filterDinnersByIngredient(dinners, ingredient) {
        return dinners.filter(dinner => dinner.ingredients.includes(ingredient));
    }

    function displayDinners(dinners, listElement, isEditable = false) {
        listElement.innerHTML = '';
        dinners.forEach((dinner, index) => {
            const dinnerItem = document.createElement('div');
            dinnerItem.classList.add('dinner-item');

            const dinnerRow = document.createElement('div');
            dinnerRow.classList.add('dinner-row');

            const dateDiv = document.createElement('div');
            dateDiv.classList.add('date-column');
            dateDiv.textContent = dinner.date;

            const nameDiv = document.createElement('div');
            nameDiv.classList.add('name-column');
            nameDiv.textContent = dinner.name;

            const ingredientsDiv = document.createElement('div');
            ingredientsDiv.classList.add('ingredients-column');
            const sortedIngredients = [...dinner.ingredients].sort();
            ingredientsDiv.textContent = sortedIngredients.join(', ');

            dinnerRow.addEventListener('click', () => {
                ingredientsDiv.classList.toggle('show');
            });

            if (isEditable) {
                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.value = dinner.name;
                nameInput.addEventListener('change', (e) => {
                    dinners[index].name = e.target.value;
                    localStorage.setItem('dinners', JSON.stringify(dinners));
                });

                const dateInput = document.createElement('input');
                dateInput.type = 'date';
                dateInput.value = dinner.date;
                dateInput.addEventListener('change', (e) => {
                    dinners[index].date = e.target.value;
                    localStorage.setItem('dinners', JSON.stringify(dinners));
                });

                nameDiv.innerHTML = '';
                nameDiv.appendChild(nameInput);

                dateDiv.innerHTML = '';
                dateDiv.appendChild(dateInput);
            }

            const editButton = document.createElement('button');
            editButton.classList.add('edit-button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent the click event from toggling the ingredients
                const newIngredients = prompt('Enter new ingredients (comma separated):', dinner.ingredients.join(', '));
                if (newIngredients !== null) {
                    dinners[index].ingredients = newIngredients.split(',').map(ing => ing.trim());
                    localStorage.setItem('dinners', JSON.stringify(dinners));
                    listAllDinners();
                }
            });

            const editDiv = document.createElement('div');
            editDiv.classList.add('edit-column');
            editDiv.appendChild(editButton);

            dinnerRow.appendChild(dateDiv);
            dinnerRow.appendChild(nameDiv);
            dinnerRow.appendChild(editDiv);

            dinnerItem.appendChild(dinnerRow);
            dinnerItem.appendChild(ingredientsDiv);

            listElement.appendChild(dinnerItem);
        });
    }

    function displayIngredients(ingredients) {
        ingredientList.innerHTML = '';
        ingredients.forEach(ingredient => {
            const li = document.createElement('li');
            li.textContent = ingredient;
            ingredientList.appendChild(li);
        });
    }

    function populateIngredientOptions() {
        const allIngredients = new Set();
        dinners.forEach(dinner => {
            dinner.ingredients.forEach(ingredient => allIngredients.add(ingredient));
        });
        ingredientOptions.innerHTML = '';
        allIngredients.forEach(ingredient => {
            const option = document.createElement('option');
            option.value = ingredient;
            ingredientOptions.appendChild(option);
        });
    }

    function showLastWeekDinners() {
        const filteredDinners = filterDinnersByDateRange(dinners, 'week');
        displayDinners(filteredDinners, dinnerList, true);
    }

    function sortAndDisplayDinners() {
        const sortedDinners = [...dinners].sort((a, b) => new Date(b.date) - new Date(a.date));
        displayDinners(sortedDinners, dinnerList, true);
    }

    function listAllDinners() {
        allDinnersList.innerHTML = '';
        const sortedDinners = [...dinners].sort((a, b) => a.name.localeCompare(b.name));
        sortedDinners.forEach((dinner, index) => {
            const dinnerItem = document.createElement('div');
            dinnerItem.classList.add('dinner-item');

            const dinnerRow = document.createElement('div');
            dinnerRow.classList.add('dinner-row');

            const dateDiv = document.createElement('div');
            dateDiv.classList.add('date-column');
            dateDiv.textContent = dinner.date;

            const nameDiv = document.createElement('div');
            nameDiv.classList.add('name-column');
            nameDiv.textContent = dinner.name;

            const ingredientsDiv = document.createElement('div');
            ingredientsDiv.classList.add('ingredients-column');
            const sortedIngredients = [...dinner.ingredients].sort();
            ingredientsDiv.textContent = sortedIngredients.join(', ');

            dinnerRow.addEventListener('click', () => {
                ingredientsDiv.classList.toggle('show');
            });

            const editButton = document.createElement('button');
            editButton.classList.add('edit-button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent the click event from toggling the ingredients
                const newIngredients = prompt('Enter new ingredients (comma separated):', dinner.ingredients.join(', '));
                if (newIngredients !== null) {
                    dinners[index].ingredients = newIngredients.split(',').map(ing => ing.trim());
                    localStorage.setItem('dinners', JSON.stringify(dinners));
                    listAllDinners();
                }
            });

            const editDiv = document.createElement('div');
            editDiv.classList.add('edit-column');
            editDiv.appendChild(editButton);

            dinnerRow.appendChild(dateDiv);
            dinnerRow.appendChild(nameDiv);
            dinnerRow.appendChild(editDiv);

            dinnerItem.appendChild(dinnerRow);
            dinnerItem.appendChild(ingredientsDiv);

            allDinnersList.appendChild(dinnerItem);
        });
    }
});
