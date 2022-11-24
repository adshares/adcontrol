import React from 'react';
import { Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFoundView({ redirectTo = undefined }) {
  const navigate = useNavigate();
  const onButtonClick = () => {
    console.log(redirectTo);
    !!redirectTo ? (window.location.href = redirectTo) : navigate('/');
  };
  return (
    <>
      <Typography variant="h3" component="div">
        Page not found.
      </Typography>
      <Button variant="contained" type="button" onClick={onButtonClick}>
        Go back
      </Button>
    </>
  );
}
