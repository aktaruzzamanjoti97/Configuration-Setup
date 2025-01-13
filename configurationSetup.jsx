import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment';
import { Fragment, useEffect, useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { FaTrashAlt } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useGetQuery,
  usePostMutation,
  usePutMutation
} from '../../../shared/api/Mutations';
import PageTitle from '../../../shared/components/Pagetitle';
import { CreateOrBackToList } from '../../../shared/components/table/CustomTableActions';
import {
  CustomCheck,
  CustomDatePicker,
  CustomInput,
  CustomSelect,
  CustomSubmit
} from '../../../shared/hook-form-components';
import useHookForm from '../../../shared/hooks/useHookForm';
import PropertyData from './PropertyData';
import PropertyName from './PropertyName';
import { configurationSchema, days, defaultValue } from './utils';

const ConfigurationSetup = () => {
  const { state } = useLocation();

  const navigate = useNavigate();
  const [hfConfigureId, setHfConfigureId] = useState(state?.id || null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [currentValue, setCurrentValue] = useState(state || defaultValue);

  const { data: propertyRateData } = useGetQuery(
    ['propertyRateType_list'],
    `/propertyRateType`
  );

  const { handleSubmit, reset, control, getValues, register, watch, setValue } =
    useHookForm({
      resolver: yupResolver(configurationSchema),
      defaultValues: currentValue
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'configurationDetails'
  });

  // create mutation
  const { mutate: createMutate, isLoading: hfSaveLoading } = usePostMutation(
    `/propertyConfiguration`,
    {
      onSuccess: (response) => {
        setHfConfigureId(response?.data?.id);
        setCurrentValue(getValues());
      }
    }
  );

  // update mutation
  const { mutate: updateMutate, isLoading: hfUpdateLoading } = usePutMutation(
    `/propertyConfiguration`,
    {
      onSuccess: (response) => {
        setHfConfigureId(response?.data?.id);
        setCurrentValue(getValues());
      }
    }
  );

  const validFromDateArr = useWatch({
    control,
    name: 'configurationDetails'
  });

  const handleFormSubmit = (data) => {
    setIsSubmitted(true);
    const { configurationDetails, ...rest } = data;

    const newConfigurationDetails = configurationDetails?.map(
      (details, index) => {
        const updatedDetailsRateRequest = propertyRateData
          ?.map((property, i) => ({
            // rateTypeName:
            //   details.configurationDetailsRates[i]?.rateTypeName || null,
            rateTypeId: property.id,
            rate: details.configurationDetailsRates[i]?.rate || null
          }))
          .filter((rateRequest) => rateRequest.rate !== null);
        const transformedPropertyNames = details.propertyNames?.map((name) => ({
          propertyName: name.propertyName
        }));
        return {
          ...details,
          configurationDetailsRates: updatedDetailsRateRequest,
          propertyName: transformedPropertyNames
        };
      }
    );

    const newData = {
      ...rest,
      configurationDetails: newConfigurationDetails
    };

    if (hfConfigureId) {
      updateMutate({ id: hfConfigureId, ...newData });
    } else {
      createMutate(newData);
    }
  };

  const handleDayChange = (v, handler) => {
    handler(v);
  };

  const handleRateChange = (v, handler) => {
    handler(v);
    setValue('rateTypeName', v.target.value);
  };

  useEffect(() => {
    reset(state || defaultValue);
  }, [state, reset]);

  return (
    <Fragment>
      <PageTitle
        activeMenu={`Hotel & Flight Configuration Setup`}
        motherMenu="Hotel & Flight Configuration"
      />
      <CreateOrBackToList path="/hf-configuration" type={'list'} />

      <form className="form-valide" onSubmit={handleSubmit(handleFormSubmit)}>
        {/* <DevTool control={control} placement="bottom-right" /> */}
        <div className="">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">
                Hotel & Flight Configuration{' '}
                {hfConfigureId === null ? 'Setup' : 'Update'}
              </h4>
              {state?.code && (
                <div className="d-flex align-items-center gap-2">
                  <h5>Configuration Name:</h5>
                  <h5>{state?.code}</h5>
                </div>
              )}
            </div>
          </div>
          {/* {!!hfConfigureId && (
            <div className="card-body">
              <div className="row">
                <div className="col-lg-6 mb-3">
                  <CustomInput
                    label="Configuration Name"
                    placeholder="Auto generated code"
                    name="code"
                    control={control}
                    conditions={{
                      disabled: true
                    }}
                  />
                </div>
              </div>
            </div>
          )} */}

          {fields?.map((field, index) => {
            const validFromDate = validFromDateArr[index]?.validFrom;
            return (
              <div key={field.id} className="card">
                <div className="card-body">
                  <div className="form-validation">
                    {fields.length > 1 && ( // Hide Remove button if only one field remains
                      <div className="d-flex justify-content-end">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="btn btn-danger mx-2">
                          <FaTrashAlt />
                        </button>
                      </div>
                    )}

                    <div className="row">
                      <div className="col-lg-6 mb-3">
                        <CustomInput
                          name={`configurationDetails.${index}.propertyCategory`}
                          placeholder="Enter Title"
                          isRequired
                          control={control}
                          label="Configuration Title"
                        />
                      </div>
                    </div>
                    <hr />

                    <h4 className="card-title mb-4">Hotel Information: </h4>

                    <PropertyName control={control} index={index} />

                    <div className="row mt-3">
                      <div className="col-lg-6 mb-3">
                        <CustomDatePicker
                          isRequired
                          name={`configurationDetails.${index}.validFrom`}
                          control={control}
                          min={hfConfigureId || isSubmitted ? null : new Date()}
                          label="Valid From"
                        />
                      </div>
                      <div className="col-lg-6 mb-3">
                        <CustomDatePicker
                          isRequired
                          name={`configurationDetails.${index}.validTo`}
                          min={
                            validFromDate
                              ? moment(validFromDate).toDate()
                              : new Date()
                          }
                          control={control}
                          label="Valid To"
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-lg-6 mb-3">
                        <CustomSelect
                          control={control}
                          // defaultValue={stepOneData?.selectionOfDays}
                          name={`configurationDetails.${index}.departureDay`}
                          label="Departure Days"
                          options={days?.map((day) => ({
                            value: day.value,
                            label: day.name
                          }))}
                          isRequired
                          // isOptionDisabled={handleOptionDisabled}
                          handleChange={handleDayChange}
                        />
                      </div>
                    </div>

                    <h4 className="card-title mb-4">Charges:</h4>

                    <div className="row">
                      <div className="col-lg-6 mb-3">
                        <CustomInput
                          name={`configurationDetails.${index}.configurationChildWiseRates.infant`}
                          placeholder="Enter Amount"
                          control={control}
                          type="number"
                          isNumberLeftAlign
                          isRequired
                          label="Infant (0-2 years)"
                        />
                      </div>
                      <div className="col-lg-6 mb-3">
                        <CustomInput
                          name={`configurationDetails.${index}.configurationChildWiseRates.threeToSix`}
                          placeholder="Enter Amount"
                          control={control}
                          type="number"
                          isRequired
                          isNumberLeftAlign
                          label="Child (3-6 years)"
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <CustomInput
                          name={`configurationDetails.${index}.configurationChildWiseRates.sevenToTwelve`}
                          placeholder="Enter Amount"
                          control={control}
                          type="number"
                          label="Child (7-12 years)"
                          isRequired
                          isNumberLeftAlign
                        />
                      </div>
                      <div className="col-md-6">
                        <CustomCheck
                          type="switch"
                          label="Price Include VAT-Tax"
                          name={`configurationDetails.${index}.vatTaxInclude`}
                          control={control}
                          options={[
                            { label: 'Yes', value: true },
                            { label: 'No', value: false }
                          ]}
                          isSwitchSingleItem
                          inlineLabel
                          isRequired
                        />
                      </div>
                    </div>

                    <div className="">
                      <h4 className="card-title my-4">Rate Type & Amount:</h4>
                    </div>

                    <PropertyData
                      index={index}
                      control={control}
                      propertyRateData={propertyRateData}
                      handleRateChange={handleRateChange}
                      maxRatesDataLength={propertyRateData?.length}
                    />

                    <hr />

                    <div className="row mt-4">
                      <div className="col-lg-6 mb-3 d-flex gap-2">
                        <label
                          className="col-lg-4 col-form-label"
                          htmlFor="withFlight">
                          With Flight
                        </label>
                        <input
                          role="switch"
                          className="form-check-input mt-2"
                          type="checkbox"
                          {...register(
                            `configurationDetails.${index}.withFlight`
                          )}
                        />
                      </div>
                    </div>

                    {watch(`configurationDetails.${index}.withFlight`) && (
                      <>
                        <h4 className="card-title mb-4">
                          Flight Information:{' '}
                        </h4>
                        <div className="row">
                          <div className="col-lg-6 mb-3">
                            <h4 className="card-title d-flex justify-content-center">
                              Departure
                            </h4>
                            <CustomInput
                              isRequired
                              name={`configurationDetails.${index}.configurationAirlines.departAirName`}
                              label="Airline Name"
                              placeholder="Enter Airline Name"
                              control={control}
                            />
                            <div className="my-3"></div>
                            <CustomInput
                              isRequired
                              name={`configurationDetails.${index}.configurationAirlines.departFlightNumber`}
                              label="Flight Number"
                              placeholder="Enter Flight Number"
                              control={control}
                            />
                            <div className="my-3"></div>
                            <CustomInput
                              isRequired
                              control={control}
                              name={`configurationDetails.${index}.configurationAirlines.departFlightTime`}
                              label="Flight Time"
                              type="time"
                              isClearable
                            />
                          </div>
                          <div className="col-lg-6 mb-3">
                            <h4 className="card-title d-flex justify-content-center">
                              Arrival
                            </h4>
                            <div className="col-lg-12 mb-3">
                              <CustomInput
                                isRequired
                                name={`configurationDetails.${index}.configurationAirlines.arrivalAirName`}
                                label="Airline Name"
                                placeholder="Enter Airline Name"
                                control={control}
                              />
                            </div>
                            <div className="col-lg-12 mb-3">
                              <CustomInput
                                isRequired
                                name={`configurationDetails.${index}.configurationAirlines.arrivalFlightNumber`}
                                label="Flight Number"
                                placeholder="Enter Flight Number"
                                control={control}
                              />
                            </div>
                            <div className="col-lg-12 mb-3">
                              <CustomInput
                                isRequired
                                control={control}
                                name={`configurationDetails.${index}.configurationAirlines.arrivalFlightTime`}
                                label="Flight Time"
                                type="time"
                                isClearable
                              />
                            </div>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-lg-6 row">
                            <div className="col-lg-12 mb-3"></div>
                          </div>
                          <div className="col-lg-6 row"></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="d-flex justify-content-end">
          <button
            type="button"
            style={{
              backgroundColor: '#362465',
              color: 'white',
              marginRight: '2rem'
            }}
            className="btn mb-3"
            onClick={() => append(defaultValue.configurationDetails[0])}>
            + Add More
          </button>
        </div>
        <div className="d-flex justify-content-end px-4 py-2">
          <CustomSubmit
            onUpdate={() => navigate(`/hf-configuration`)}
            path="/hf-configuration"
            isUpdateMood={!!hfConfigureId}
            isLoading={hfUpdateLoading || hfSaveLoading}
            onReset={() => {
              reset(currentValue);
            }}
          />
        </div>
      </form>
    </Fragment>
  );
};

export default ConfigurationSetup;
