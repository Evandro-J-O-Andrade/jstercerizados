export interface RHColaboradorFormValues {
  person_id: string;
  employee_code: string;
  hire_date: string;
  termination_date: string;
  salary: string;
  status: string;
}

export function emptyRHColaboradorForm(): RHColaboradorFormValues {
  return {
    person_id: '',
    employee_code: '',
    hire_date: '',
    termination_date: '',
    salary: '',
    status: 'active',
  };
}
