import React, { useEffect, useState } from 'react';
import { Box, Button, Collapse, Table, TableBody, TableCell, TableRow, TextField } from '@mui/material';
import apiService from '../../../utils/apiService';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import styles from './styles.scss';
import { useForm, useSkipFirstRenderEffect } from '../../../hooks';
import Spinner from '../../../Components/Spinner/Spinner';

function Wallet({ handleNextStep, handlePrevStep, step }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isHostVerification, setIsHostVerification] = useState(false);
  const { fields, errorObj, setFields, isFormValid, onFormChange, validate } = useForm({
    wallet_address: '',
    wallet_secret_key: '',
  });
  const {
    fields: nodeHost,
    setFields: setNodeHost,
    errorObj: nodeHostError,
    isFormValid: isNodeHostValid,
    onFormChange: onNodeHostChange,
  } = useForm({
    wallet_node_host: '',
    wallet_node_port: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [dataRequired, setDataRequired] = useState(false);
  const [alert, setAlert] = useState({
    type: '',
    message: '',
    title: '',
  });
  const [isKnownNode, setKnownNode] = useState(false);

  useEffect(() => {
    getStepData();
  }, []);

  useSkipFirstRenderEffect(() => {
    if (!errorObj.wallet_address) {
      getWalletNodes();
    }
  }, [errorObj.wallet_address, fields.wallet_address]);

  useEffect(() => {
    checkIsKnownNode(fields.wallet_address);
  }, [fields.wallet_address]);

  const getStepData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCurrentStepData(step.path);
      setFields({ ...fields, ...response });
      setEditMode(response.data_required);
      setDataRequired(response.data_required);
      if (response.wallet_node_host) {
        setNodeHost({
          wallet_node_host: response.wallet_node_host,
          wallet_node_port: response.wallet_node_port,
        });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.data.message,
        title: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getWalletNodes = async () => {
    try {
      setIsHostVerification(true);
      const response = await apiService.getWalletNodeHost({ wallet_address: fields.wallet_address });
      setNodeHost({ ...response });
    } catch (err) {
      setNodeHost({
        wallet_node_host: '',
        wallet_node_port: '',
      });
      setAlert({
        type: 'error',
        message: err.data.message,
        title: err.message,
      });
    } finally {
      setIsHostVerification(false);
    }
  };

  const checkIsKnownNode = (walletAddress) => {
    const walletAddressRegEx = /^[0-9A-F]{4}-[0-9A-F]{8}-([0-9A-F]{4})$/g;
    if (!walletAddressRegEx.test(walletAddress)) {
      return;
    }
    const expression = walletAddress.slice(0, 4);
    if (parseInt(expression, 16) > 0 && parseInt(expression, 16) <= 34) {
      setKnownNode(true);
      return;
    }
    setKnownNode(false);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (!editMode) {
        handleNextStep(step);
        return;
      }
      const body = {
        wallet_address: fields.wallet_address,
        wallet_secret_key: fields.wallet_secret_key,
        wallet_node_host: nodeHost.wallet_node_host,
        wallet_node_port: Number(nodeHost.wallet_node_port),
      };
      await apiService.sendStepData(step.path, body);
      handleNextStep(step);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.data.message,
        title: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <InstallerStepWrapper
      alert={alert}
      dataLoading={isLoading}
      title="Wallet information"
      onNextClick={handleSubmit}
      disabledNext={editMode ? !isFormValid || !isNodeHostValid || isHostVerification || nodeHost.code === 422 : isLoading}
      onBackClick={() => handlePrevStep(step)}
    >
      <Box className={styles.editButtonThumb}>
        <Button className={dataRequired ? styles.hidden : styles.visible} onClick={() => setEditMode(!editMode)} type="button">
          {editMode ? 'Cancel' : 'Edit'}
        </Button>
      </Box>
      {editMode && (
        <Box className={styles.container}>
          <Box
            component="form"
            className={styles.formBlock}
            onChange={onFormChange}
            onBlur={(e) => validate(e.target)}
            onSubmit={(e) => e.preventDefault()}
          >
            <TextField
              className={styles.textField}
              error={!!errorObj.wallet_address}
              helperText={errorObj.wallet_address}
              value={fields.wallet_address}
              margin="normal"
              size="small"
              name="wallet_address"
              label="Wallet address"
              type="text"
              inputProps={{ autocomplete: 'off' }}
              required
            />
            <TextField
              error={!!errorObj.wallet_secret_key}
              helperText={errorObj.wallet_secret_key}
              value={fields.wallet_secret_key}
              margin="normal"
              size="small"
              name="wallet_secret_key"
              label="Wallet private key"
              type="password"
              inputProps={{ autocomplete: 'off' }}
              required
            />
          </Box>
          <Collapse
            className={styles.formBlock}
            component="form"
            in={Object.values(nodeHost).some((el) => !!el) && !isKnownNode}
            timeout="auto"
            unmountOnExit
            onChange={onNodeHostChange}
            onSubmit={(e) => e.preventDefault()}
          >
            {isHostVerification ? (
              <Spinner />
            ) : (
              <>
                <TextField
                  error={!!nodeHostError.wallet_node_host}
                  helperText={nodeHostError.wallet_node_host}
                  value={nodeHost.wallet_node_host}
                  disabled={!!nodeHost.code}
                  margin="normal"
                  size="small"
                  name="wallet_node_host"
                  label="Wallet node host"
                  fullWidth
                  inputProps={{ autocomplete: 'off' }}
                />
                <TextField
                  error={!!nodeHostError.wallet_node_port}
                  helperText={nodeHostError.wallet_node_port}
                  value={nodeHost.wallet_node_port}
                  disabled={!!nodeHost.code}
                  margin="normal"
                  size="small"
                  name="wallet_node_port"
                  label="Wallet node port"
                  fullWidth
                  inputProps={{ autocomplete: 'off' }}
                />
              </>
            )}
          </Collapse>
        </Box>
      )}

      {!editMode && (
        <Table>
          <TableBody>
            <TableRow>
              <TableCell align="center">Your wallet address</TableCell>
              <TableCell align="center">{fields.wallet_address}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </InstallerStepWrapper>
  );
}

export default Wallet;
