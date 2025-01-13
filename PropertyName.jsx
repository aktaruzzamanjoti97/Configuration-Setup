import React from 'react';
import { useFieldArray, useFormState } from 'react-hook-form';
import RemoveActionButton from '../../../shared/components/button/RemoveActionButton';
import { CustomInput } from '../../../shared/hook-form-components';

const PropertyName = ({ control, index }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `configurationDetails.${index}.propertyNames`
  });

  return (
    <>
      <div className="row">
        {fields.map((item, i) => (
          <div
            className="col-lg-6 mb-3 position-relative"
            key={item.id}>
            <CustomInput
              isRequired
              name={`configurationDetails.${index}.propertyNames.${i}.propertyName`}
              label={`${i + 1}. Property Name`}
              placeholder="Enter Property Name"
              control={control}
            />
            <RemoveActionButton
              disabled={fields.length === 1}
              onClick={() => remove(index)}
            />
          </div>
        ))}
      </div>
      <div className="d-flex justify-content-end">
        <button
          type="button"
          onClick={() => {
            append({
              propertyName: ''
            });
          }}
          style={{ width: '150px' }}
          className="btn btn-primary mx-2 mb=2">
          Add More
        </button>
      </div>
    </>
  );
};

export default PropertyName;
