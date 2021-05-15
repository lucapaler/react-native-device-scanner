import { useState, useEffect } from 'react';
import { ErrorTexts } from '../../../constants'


const useValidation = ({ Field, ErrorObj, IsRequired, Limit, AllowedChars, Compare }) => {

    function endValidate(value) {
        if (IsRequired && !value) {
            ErrorObj.methods.isRequired()
            return false
        }
        ErrorObj.methods.removeErrorObj()
        return true
    }


    function typeValidate(value) {
        if (Limit?.min) {
            const currentVal = (Field.type === 'text') ? value.length : value

            if (currentVal < Limit.min) {
                ErrorObj.methods.underLimit(Limit.min)
                return false
            }
        }

        if (Limit?.max) {
            const currentVal = (Field.type === 'text') ? value.length : value
            if (currentVal > Limit.max) {
                ErrorObj.methods.overLimit(Limit.max)
                return false
            }
        }

        if (AllowedChars && !AllowedChars.test(value)) {
            ErrorObj.methods.invalidType()
            return false
        }

        if (Compare) {
            if (!eval(`${value || 0}${Compare.operator}${Compare.obj.props.value || 0}`)) {
                ErrorObj.methods.invalidConstraint(Compare)
                return false
            }
        }

        return true
    }


    function validate(value) {
        return endValidate(value) && typeValidate(value)
    }

    return {
        methods: {
            endValidate,
            typeValidate,
            validate,
        }
    }
}

const useErrorObj = ({ FieldName, FieldType, ErrorHandler }) => {
    // const [errorStatus, setErrorStatus] = useState(false)
    const [status, setStatus] = useState('')

    function invalidType() {
        // setErrorStatus(true)
        setStatus('danger')
        ErrorHandler.methods.setVisible(true)
        ErrorHandler.methods.setError(`${ErrorTexts.invalidType} ${FieldName}`)
    }

    function underLimit(charLimit) {
        // setErrorStatus(true)
        setStatus('danger')
        ErrorHandler.methods.setVisible(true)
        ErrorHandler.methods.setError(`${ErrorTexts.limit[FieldType].min} ${charLimit}`)
    }

    function overLimit(charLimit) {
        // setErrorStatus(true)
        setStatus('danger')
        ErrorHandler.methods.setVisible(true)
        ErrorHandler.methods.setError(`${ErrorTexts.limit[FieldType].max} ${charLimit}`)
    }

    function isRequired() {
        // setErrorStatus(true)
        setStatus('danger')
        ErrorHandler.methods.setVisible(true)
        ErrorHandler.methods.setError(`${FieldName} ${ErrorTexts.required}`)
    }

    function invalidConstraint(Compare) {
        // setErrorStatus(true)
        setStatus('danger')
        ErrorHandler.methods.setVisible(true)
        ErrorHandler.methods.setError(`${FieldName} ${Compare.operator} ${Compare.obj.methods.getFieldInfo().name}`)
    }

    function removeErrorObj() {
        // setErrorStatus(false)
        setStatus('primary')
        ErrorHandler.methods.setVisible(false)
        ErrorHandler.methods.setError(``)
    }

    // function getErrorStatus() {
    //     return errorStatus
    // }

    return {
        props: {
            status
        },
        methods: {
            invalidType,
            underLimit,
            overLimit,
            isRequired,
            invalidConstraint,
            // getErrorStatus,
            removeErrorObj
        }
    }
}


export const useInputField = ({ Field, ErrorHandler, IsRequired, Limit, AllowedChars, Compare }) => {
    const [value, setValue] = useState(`${Field.value}`)
    const errorObj = useErrorObj({ FieldName: Field.name, FieldType: Field.type, ErrorHandler })
    const validation = useValidation({ Field, ErrorObj: errorObj, IsRequired, Limit, AllowedChars, Compare })

    function onChangeText(value) {
        const validate = validation.methods.typeValidate(value)

        if (ErrorHandler.props.visible && validate) {
            errorObj.methods.removeErrorObj()
        }

        setValue(value)

    }

    return {
        props: {
            ...errorObj.props,
            value: value,
            onChangeText
        },
        methods: {
            getFieldInfo: () => Field,
            setInputFieldValue: setValue,
            validate: () => validation.methods.validate(value.trim() || ``)
        }
    }

}


export const useToggleState = (initialState = false) => {
    const [checked, setChecked] = useState(initialState);

    const onCheckedChange = (isChecked) => {
        setChecked(isChecked);
    };

    return { checked, onChange: onCheckedChange };
};


export const useFormData = (initialData) => {
    const [data, setData] = useState(initialData || {})

    useEffect(() => {
        console.log(data)
    }, [data])

    return {
        data: data,
        getFormData: () => data,
        setFormData: (newData) => setData(newData),
        // updateFormData:  (updatedData) => setData({...data, ...updatedData})
        updateFormData: updatedData =>
            new Promise(resolve => {
                const dt = { ...data, ...updatedData }
                setData(dt)
                resolve(dt)
            }
            )
    }
}

export const useErrorHandler = ({ text, isVisible }) => {
    const [errorText, setErrorText] = useState(text)
    const [visible, setVisible] = useState(isVisible)


    return {
        props: {
            text: errorText,
            visible,
            setVisible
        },
        methods: {
            setError: setErrorText,
            setVisible
        }
    }
}