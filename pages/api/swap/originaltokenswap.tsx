// Import necessary packages
"use client"
import { useForm, useFormContext, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {useEffect, useContext} from 'react'

// Define your Yup schema
const schema = yup.object({
  // Define your form fields with validation rules
  firstName: yup.string().required('First Name is required'),
  lastName: yup.string().required('Last Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
});

// Define your form data type
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
}

// Your form component
const YourFormComponent: React.FC = () => {
  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  // Handle form submission
  const onSubmit = (data: FormData) => {
    // Handle the form data
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* First Name */}
      <label>
        First Name:
        <input {...register('firstName')} />
        <p>{errors.firstName?.message}</p>
      </label>

      {/* Last Name */}
      <label>
        Last Name:
        <input {...register('lastName')} />
        <p>{errors.lastName?.message}</p>
      </label>

      {/* Email */}
      <label>
        Email:
        <input {...register('email')} />
        <p>{errors.email?.message}</p>
      </label>

      {/* Submit Button */}
      <button type="submit">Submit</button>
    </form>
  );
};

export default YourFormComponent;
