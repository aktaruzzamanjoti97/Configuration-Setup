import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetQuery, usePatchMutation } from '../../../shared/api/Mutations';
import PageTitle from '../../../shared/components/Pagetitle';
import { CustomTable } from '../../../shared/components/table/CustomTable';
import {
  ActiveInactive,
  CreateOrBackToList,
  DeleteAction,
  EditAction
} from '../../../shared/components/table/CustomTableActions';
import useTableColumn from '../../../shared/hooks/useTableColumn';
import { Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { dateFormatter } from '../../../utilities/dateFormatter';

const ConfigurationList = () => {
  const { data, isLoading, refetch } = useGetQuery(
    ['property_configuration_list'],
    `/propertyConfiguration`
  );

  const {
    mutate: configurationActivationMutation,
    isLoading: configurationActivationLoading
  } = usePatchMutation('/propertyConfiguration', {
    onSuccess: () => {
      refetch();
    }
  });

  const couponActionFn = (tableInstance) => {
    const navigate = useNavigate();

    return (
      <>
        <div className="d-flex gap-1 justify-content-center">
          <EditAction
            onCLick={() => {
              navigate('/hf-configuration/create', {
                state: tableInstance?.row?.original
              });
            }}
          />

          <DeleteAction
            title="Coupon"
            apiEndpoint={`/hf-configuration`}
            id={tableInstance?.row?.original?.id}
            refetch={refetch}
          />
        </div>
      </>
    );
  };

  const handleCheck = (props) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `This will mark this Status as ${props.getValue() ? 'inactive' : 'active'}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#9568FF',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, change it!'
    }).then(function (result) {
      if (result.isConfirmed) {
        configurationActivationMutation({
          id: props.row.original.id
        });
      }
    });
  };

  const columnsData = [
    {
      key: 'code',
      header: () => (
        <span className="d-flex justify-content-center">
          Configuration Code
        </span>
      ),
      cell: (p) => (
        <div className="d-flex justify-content-center"> {p.getValue()} </div>
      )
    },
    {
      key: 'validFrom',
      header: () => (
        <span className="d-flex justify-content-center">Valid From</span>
      ),
      cell: (p) => {
        const configurationDetails = p.row.original.configurationDetails[0];
        return (
          <div className="d-flex justify-content-center align-items-center gap-1">
            {configurationDetails && (
              <i className="fa-regular fa-calendar text-secondary"></i>
            )}
            {dateFormatter(configurationDetails.validFrom)}
          </div>
        );
      }
    },
    {
      key: 'validTo',
      header: () => (
        <span className="d-flex justify-content-center">Valid To</span>
      ),
      cell: (p) => {
        const configurationDetails = p.row.original.configurationDetails[0];
        return (
          <div className="d-flex justify-content-center align-items-center gap-1">
            {configurationDetails && (
              <i className="fa-regular fa-calendar text-secondary"></i>
            )}
            {dateFormatter(configurationDetails.validTo)}
          </div>
        );
      }
    },
    {
      key: 'isActive',
      header: () => (
        <span className="d-flex justify-content-center">Active</span>
      ),
      cell: (props) => (
        <div className="d-flex gap-1 justify-content-center align-items-center">
          {/* TODO - use the custom check component from the shared folder */}
          <Form.Check
            key={props.cell.id}
            type="switch"
            checked={props.getValue()}
            onChange={() => handleCheck(props)}
          />
          <p className="mb-0 mt-1">
            {props.getValue() ? 'Active' : 'Inactive'}
          </p>
        </div>
      )
    },
    {
      key: 'id',
      header: () => <span>Actions</span>,
      cell: couponActionFn
    }
  ];

  const { columnData } = useTableColumn({ columnsData });

  return (
    <Fragment>
      <PageTitle
        activeMenu={'HF Configuration List'}
        motherMenu="HF Configuration"
      />

      <CreateOrBackToList path={'/hf-configuration/create'} type="create" />

      <CustomTable
        isLoading={isLoading || configurationActivationLoading}
        columns={columnData}
        data={data}
        title="Hotel & Flight Configuration List"
      />
    </Fragment>
  );
};

export default ConfigurationList;
