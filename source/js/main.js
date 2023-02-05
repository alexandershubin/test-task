window.addEventListener('DOMContentLoaded', function () {
    const EMAIL_REGEXP = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/ui;
    const form = document.querySelector('.form');
    const popupPage = document.querySelector('.popup');
    const popupPageContent = document.querySelector('.popup__content');
    const thankPage = document.querySelector('.thank');
    const thankPageContent = document.querySelector('.thank__content');
    const errorPage = document.querySelector('.error-page');
    const errorPageContent = document.querySelector('.error-page__content');
    const url = 'https://api.dating.com/identity';
    const urlToken = 'https://www.dating.com/people/#token=';
    const tokenAuth = localStorage.getItem('token');

    const getLocationWidthToken = (token) => {
        return location.href = `${urlToken}${token}`;
    }

    if (tokenAuth) {
        getLocationWidthToken(tokenAuth);
        return;
    }

    const handleOpenPopup = () => {
        const btn = document.querySelector('.participate__btn');
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            popupPage.classList.add('active');
            popupPageContent.classList.add('active');
        })
    }

    const handleClosePopup = (firstEl, secondEl) => {
        const closePopupButton = document.querySelectorAll('.close-popup');

        closePopupButton.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                firstEl.classList.remove('active');
                secondEl.classList.remove('active');
            });
        })

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                firstEl.classList.remove('active');
                secondEl.classList.remove('active');
            }
        });
    }

    const removeError = (input) => {
        const parent = input.parentNode;

        if (parent.classList.contains('error')) {
            parent.querySelector('.error-span').remove();
            parent.querySelector('.error-img').remove();
            parent.classList.remove('error');
            parent.querySelector('.form__input').classList.remove('active');
        }
    }

    const createError = (input, text) => {
        const parent = input.parentNode;

        const errorLabel = document.createElement('span');
        errorLabel.classList.add('error-span');
        errorLabel.textContent = text;

        const errorImg = document.createElement('img');
        errorImg.classList.add('error-img');
        errorImg.src = 'img/error.svg';
        errorImg.alt = 'error';
        errorImg.width = 20;
        errorImg.height = 21;

        parent.append(errorLabel);
        parent.append(errorImg);
        parent.classList.add('error');
        parent.querySelector('.form__input').classList.add('active');
    }

    const validation = (form) => {
        let result = true;

        form.querySelectorAll("input").forEach((input) => {
            removeError(input)

            if (input.dataset.minLength) {
                if (input.value.length < input.dataset.minLength) {
                    createError(input, 'Please enter a valid password');
                    result = false;
                }
            }

            if (input.dataset.name) {
                if (!EMAIL_REGEXP.test(input.value)) {
                    createError(input, 'Please enter a valid email');
                    result = false;
                }
            }
        })

        return result;
    }

    const requestAuth = (login, password) => {
        return fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Basic " + btoa(`${login}:${password}`)
            },
            method: 'GET',
        }).then((response) => {
            return response.headers.get('x-token');
        })
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        if (validation(form)) {
            const token = await requestAuth(payload.email, payload.password);

            if (token) {
                getLocationWidthToken(token);
                return;
            }

            await fetch(url, {
                headers: {'Content-Type': 'application/json'},
                method: 'PUT',
                body: JSON.stringify(payload)
            }).then((response) => {
                if (response.ok) {
                    popupPage.classList.remove('active');
                    popupPageContent.classList.remove('active');
                    thankPage.classList.add('active');
                    thankPageContent.classList.add('active');

                    const token = response.headers.get('x-token');
                    localStorage.setItem('token', token);
                    return token;
                } else {
                    popupPage.classList.remove('active');
                    popupPageContent.classList.remove('active');
                    errorPage.classList.add('active');
                    errorPageContent.classList.add('active');

                    throw Error('Авторизация не прошла');
                }
            }).then((token) => {
                setTimeout(() => getLocationWidthToken(token), 2000);
            })
                .catch(e => {
                    console.log(e, 'error');
                });
        }
    }

    form.addEventListener('submit', handleFormSubmit);
    handleOpenPopup();
    handleClosePopup(popupPage, popupPageContent);
    handleClosePopup(thankPage, thankPageContent);
    handleClosePopup(errorPage, errorPageContent);
});
