import React, { useEffect, useState } from 'react'
import apiService from '../../../utils/apiService'
import WindowCard from '../../../Components/WindowCard/WindowCard'
import { Box, LinearProgress, Typography } from '@mui/material'
import styles from './styles.scss'

const Classifier = ({ handleNextStep, handlePrevStep, step }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [registrationInProgress, setRegistrationInProgress] = useState(false)
  const [stepData, setStepData] = useState({})
  const [alert, setAlert] = useState({type: '', message: ''})

  useEffect(() => {
    getStepData()
  }, [])

  const getStepData = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getCurrentStepData(step.path)
      setStepData({ ...stepData, ...response })
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.data.message,
        title: err.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setRegistrationInProgress(true)
      await apiService.sendStepData(step.path, {})
      handleNextStep(step)
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.data.message,
        title: err.message
      })
    } finally {
      setRegistrationInProgress(false)
    }
  }

  return (
    <WindowCard
      alert={alert}
      dataLoading={isLoading}
      title="Classifier information"
      onNextClick={handleSubmit}
      disabledNext={registrationInProgress || isLoading}
      onBackClick={() => handlePrevStep(step)}
    >

      <Box className={styles.container}>
        <Typography variant="h5">
          Registration in AdClassify
        </Typography>
        {registrationInProgress && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        )}
      </Box>

    </WindowCard>
  )
}

export default Classifier


