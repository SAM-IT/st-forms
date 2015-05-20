(function($) {

    var self = $.fn.stForm = function() {
        this.on('change', '[st-form]', function(e) { return self.validate(e.target); });
        this.on('submit', function(e) {
            // Submit can have a target that is not the st-form.
            $target = $(e.target).find('[st-form]');

            $target.each(function () {
                if (!self.submit(this)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return;
                }
            });
        });
        this.on('keyup blur', '[st-form][st-form-validate-live]', function(e) { return self.validate(e.target); });
    }
    self.settings = function(target) {
        var result  = {};
        result.$form = $(target).closest('[st-form]');
        result.invalidClass = result.$form.attr('st-invalid-class') || 'st-invalid';
        result.validClass = result.$form.attr('st-valid-class') || 'st-valid';
        result.touchedClass = result.$form.attr('st-touched-class') || 'st-touched';
        // Uses .closest on the element with this filter to mark valid / invalid.
        result.validationTarget = result.$form.attr('st-target') || '*';
        return result;
    };
    // Prevent submission on input errors.
    self.submit = function(target) {
        // Submit can have a target that is not the st-form.
        var settings = self.settings(target);
        self.validate(target);
        return (settings.$form.find('.' + settings.invalidClass).length == 0);
    };
    self.getters = {
        'radio' : function() { return $(this).find(':checked').val() || []; },
        // This will return an empty array instead of null for multiple select with no selections.
        'array' : function() { return $(this).val() || []; },
    };
    self.createValidator = function(definition) {
        // Create a validator (Closure) from a string definition.
        return new Function("value", "values", "elem", definition);
    };
    self.createGetter = function(definition) {
        // Create a getter (Closure) from a string definition.
        if (!self.getters.hasOwnProperty(definition)) {
            self.getters[definition] = new Function(definition);
        }
        return self.getters[definition];
    };
    self.validate = function (target) {
        var settings = self.settings(target);

        $(target).closest('[st-input]').closest(settings.validationTarget).addClass(settings.touchedClass);
        // Find all elements for form.
        // Support all elements that have a validator.
        $elements = settings.$form.find('[st-input]');
        if (typeof settings.$form.attr('id') != 'undefined') {
            $elements.add($('body').find('[form="' + settings.$form.attr('id') + '"]'));
        }
        // We get all elements.
        var formElements = {};
        $elements.each(function(i, elem) {
            var $elem = $(elem);
            var name = $elem.attr('name');
            var $target;
            var formElement = {
                dirty : $elem.is('.st-dirty'),
                $target : $target = $elem.closest(settings.validationTarget),
                touched : $target.hasClass(settings.touchedClass),
                validators: [],
                name: name,
                $elem : $elem,
                $error : settings.$form.find('[st-error="*"], [st-error="' + name + '"]').empty(),
                errors: [],
                valid: true,
                getter: (typeof $elem.attr('st-getter') != 'undefined') ? self.createGetter($elem.attr('st-getter')) : function() { return $(this).val(); }

            };
            formElement.value = formElement.getter.apply(elem);
            try {
                $.each(JSON.parse($elem.attr('st-validators')), function (i, validator) {
                    try {
                        formElement.validators.push(self.createValidator(validator));
                    } catch (e) {
                        console.log("There was an error in one of you validators for " + name);
                        console.log(validator);
                    }
                });
            } catch (e) {
                console.log("There was an error in one of you validators for " + name);
                console.log(e);
                return;
            }
            formElements[name] = formElement;
        });

        $.each(formElements, function(i, formElement) {
            $.each(formElement.validators, function(j, validator) {
                var result = validator.call(formElement, formElement.value, formElements, formElement);
                if (result !== true) {
                    // Works for both a single error (string) and multiple errors (array).
                    formElement.errors = formElement.errors.concat(result);
                    formElement.valid = false;
                }
            });
        })

        // Highlight invalid elements and add error..
        $.each(formElements, function(i, formElement) {
            if (!formElement.valid) {
                formElement.$target.addClass(settings.invalidClass).removeClass(settings.validClass);
                for (var i = formElement.errors.length - 1; i >= 0; i--) {
                    var error = $('<p/>');
                    error.addClass('st-error');
                    if (formElement.touched) {
                        error.addClass(settings.touchedClass);
                    }
                    error.text(formElement.errors[i]);
                    formElement.$error.append(error);

                }
            } else {
                formElement.$target.removeClass(settings.invalidClass).addClass(settings.validClass);
            }
        });

    }




}) (jQuery);