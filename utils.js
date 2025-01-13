import * as yup from 'yup';

export const defaultValue = {
  configurationDetails: [
    {
      // id: null,
      validFrom: '',
      validTo: '',
      propertyCategory: '',
      departureDay: '',
      vatTaxInclude: true,
      withFlight: true,
      propertyNames: [
        {
          propertyName: ''
        }
      ],
      configurationDetailsRates: [
        {
          id: null,
          rateTypeId: null,
          rateTypeName: '',
          rate: null
        }
      ],
      configurationChildWiseRates: {
        infant: null,
        threeToSix: null,
        sevenToTwelve: null
      },
      configurationAirlines: {
        departAirName: '',
        departFlightNumber: '',
        departFlightTime: '',
        arrivalAirName: '',
        arrivalFlightNumber: '',
        arrivalFlightTime: ''
      }
    }
  ]
};

export const configurationSchema = yup.object().shape({
  configurationDetails: yup.array().of(
    yup.object().shape({
      propertyNames: yup
        .array()
        .of(
          yup.object().shape({
            propertyName: yup
              .string()
              .required('Property name is required')
              .max(50, 'Property name must be at most 50 characters')
          })
        )
        .min(1, 'At least one property name is required'),
      validFrom: yup
        .date()
        .required('Valid from date is required')
        .typeError('Valid from date must be a valid date'),
      validTo: yup
        .date()
        .required('Valid to date is required')
        .typeError('Valid to date must be a valid date')
        .min(yup.ref('validFrom'), 'Valid to must be after Valid From')
        .test(
          'is-after-or-equal',
          'Valid to date must be after or equal to valid from date',
          function (value) {
            const { validFrom } = this.parent;

            // Ensure validFrom and validTo are valid dates
            const validFromDate = validFrom ? new Date(validFrom) : null;
            const validToDate = value ? new Date(value) : null;

            // Check if both dates are valid and validFrom is less than or equal to validTo
            if (validFromDate && validToDate) {
              return validFromDate <= validToDate;
            }

            // If validFrom or validTo is not provided, skip validation
            return true;
          }
        ),

      propertyCategory: yup.string().required('Property category is required'),
      departureDay: yup.string().required('Departure day is required'),
      vatTaxInclude: yup.boolean().required(),
      withFlight: yup.boolean().required(),
      configurationChildWiseRates: yup.object().shape({
        infant: yup
          .number()
          .transform((value, originalValue) =>
            originalValue === '' ? null : value
          )
          .required('Rate for infant is required')
          .positive(),
        threeToSix: yup
          .number()
          .transform((value, originalValue) =>
            originalValue === '' ? null : value
          )
          .required('Rate for 3-6 years is required')
          .positive(),
        sevenToTwelve: yup
          .number()
          .transform((value, originalValue) =>
            originalValue === '' ? null : value
          )
          .required('Rate for 7-12 years is required')
          .positive()
      }),
      configurationAirlines: yup
        .object()
        .shape({})
        .when('withFlight', {
          is: true,
          then: () =>
            yup.object().shape({
              departAirName: yup
                .string()
                .required('Departure airline is required'),
              departFlightNumber: yup
                .string()
                .required('Departure flight number is required'),
              departFlightTime: yup
                .string()
                .required('Departure flight time is required'),
              arrivalAirName: yup
                .string()
                .required('Arrival airline name is required'),
              arrivalFlightNumber: yup
                .string()
                .required('Arrival flight number is required'),
              arrivalFlightTime: yup
                .string()
                .required('Arrival flight time is required')
            }),
          otherwise: () => yup.object().shape({}).notRequired()
        })
    })
  )
});

export const days = [
  {
    name: 'Everyday',
    value: 0
  },
  {
    name: 'Specific Day',
    value: 1
  }
];
