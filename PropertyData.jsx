import React from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import RemoveActionButton from '../../../shared/components/button/RemoveActionButton';
import {
  CustomInput,
  CustomSelect
} from '../../../shared/hook-form-components';

const PropertyData = ({
  control,
  index,
  handleRateChange,
  propertyRateData,
  maxRatesDataLength
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `configurationDetails.${index}.configurationDetailsRates`
  });

  const selectedRates =
    useWatch({
      control,
      name: `configurationDetails.${index}.configurationDetailsRates`
    }) || [];

  const propertyRateDataValues =
    propertyRateData?.map((d) => ({
      name: d.code,
      value: d.code
    })) || [];

  const getFilteredOptions = (currentIndex) => {
    const selectedValues = selectedRates.map((item) => item?.rateTypeName);
    return propertyRateDataValues.filter(
      (option) =>
        !selectedValues.includes(option.value) ||
        selectedRates[currentIndex]?.rateTypeName === option.value
    );
  };

  return (
    <div className="mt-4">
      <div className="row my-2">
        {fields.map((item, i) => (
          <>
            <div key={item.id} className="col-md-2 my-2">
              <CustomSelect
                control={control}
                name={`configurationDetails.${index}.configurationDetailsRates[${i}].rateTypeName`}
                hideLabel
                options={getFilteredOptions(i).map((d) => ({
                  value: d.value,
                  label: d.name
                }))}
                handleChange={handleRateChange}
              />
            </div>
            <div className="col-md-4 position-relative my-2">
              <CustomInput
                control={control}
                name={`configurationDetails.${index}.configurationDetailsRates[${i}].rate`}
                hideLabel
                isNumberLeftAlign
                type="number"
                placeholder="Enter Amount"
              />
              <RemoveActionButton
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              />
            </div>
          </>
        ))}
      </div>
      <div className="d-flex justify-content-end my-2">
        <button
          type="button"
          onClick={() =>
            append({ rate: null, rateTypeId: null, rateTypeName: '' })
          } // Add default values
          className="btn btn-primary"
          style={{ width: '150px' }}
          disabled={fields.length >= maxRatesDataLength}>
          Add More
        </button>
      </div>
    </div>
  );
};

export default PropertyData;
