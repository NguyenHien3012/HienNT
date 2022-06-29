function Validator(options) {
    var selectorRules = {};
    //hàm thực hiện validate
    function Validate(inputElement, rule) {
        var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
        var errorMessage
        // lấy ra các rule của các selector
        var rules = selectorRules[rule.selector]
        //lặp qua từng rule và kiểm tra
        //nếu có lỗi thì dừng việc kiểm tra
        for (var i = 0; i < rules.length; ++i) {
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) break;
        }
        if (errorMessage) {
            errorElement.innerText = errorMessage;
            inputElement.parentElement.classList.add('invalid');
        } else {
            errorElement.innerText = '';
            inputElement.parentElement.classList.remove('invalid');
        }
        return !errorMessage;
    }
    // lấy element của from
    var formElement = document.querySelector(options.form);
    if (formElement) {
        //  khi submiit fromt
        formElement.onsubmit = function (e) {
            e.preventDefault();
            var isFromValid = true;

            //lặp qua từng rules và validate
            options.rules.forEach(function (rule) {
                var inputElement = document.querySelector(rule.selector);
                var isValid = Validate(inputElement, rule);
                if (!isValid) {
                    isFromValid = false;
                }
            });
            if (isFromValid) {
                // khi submit với javascript
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        return (values[input.name] = input.value) && values;
                    }, {});
                    options.onSubmit(formValues);

                }
            }

        }
        //lặp qua mỗi rule và xử lý (lắng nghe sự kiện)
        options.rules.forEach(function (rule) {
            // lưu lại các rule trong mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }
            var inputElement = document.querySelector(rule.selector)
            if (inputElement) {
                inputElement.onblur = function () {
                    Validate(inputElement, rule);
                }
                inputElement.oninput = function () {
                    var errorElement = inputElement.parentElement.querySelector('.error-txt');
                    errorElement.innerText = '';
                    inputElement.parentElement.classList.remove('invalid');
                }
            }
        });
    }
}
Validator.isRequired = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : "This field is required"
        }
    };
}
Validator.isEmail = function (selector) {
    return {
        selector: selector,
        test: (value) => {
            var regex = /^\w+([\.+-]?\w+)*@\w+([\+.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : "Invalid email address format";
        }
    };
}
Validator.minLength = function (selector) {
    return {
        selector: selector,
        test: (value) => {
            return value.length >= 8 ? undefined : "Enter the minimum 8 character";
        }
    };
}
