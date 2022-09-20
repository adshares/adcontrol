import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import configSelectors from '../../../redux/config/configSelectors';
import { useCreateNotification, useForm } from '../../../hooks';
import {
  useSetAutoWithdrawalConfigMutation,
  useSetRegistrationModeConfigMutation,
  useSetRegulationsConfigMutation,
} from '../../../redux/config/configApi';
import {
  changeAutoWithdrawalConfigInformation,
  changeRegistrationModeInformation,
  changeRegulationsInformation,
} from '../../../redux/config/configSlice';
import { adsToClicks, clicksToAds, compareArrays, returnNumber, setDecimalPlaces } from '../../../utils/helpers';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Collapse,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Radio,
  RadioGroup,
  Select,
  TextField,
} from '@mui/material';
import commonStyles from '../../common/commonStyles.scss';

export default function Settings() {
  return (
    <>
      <RegistrationModeCard />
      <AutoWithdrawalCard />
      <PrivacyCard />
      <TermAndConditionCard />
    </>
  );
}

const RegistrationModeCard = () => {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setRegistrationModeConfig, { isLoading }] = useSetRegistrationModeConfigMutation();
  const [RegistrationMode, setRegistrationMode] = useState(appData.AdServer.RegistrationMode || 'public');
  const [EmailVerificationRequired, setEmailVerificationRequired] = useState(
    RegistrationMode === 'private' ? false : appData.AdServer.EmailVerificationRequired || false,
  );
  const [AutoConfirmationEnabled, setAutoConfirmationEnabled] = useState(
    RegistrationMode === 'private' ? false : appData.AdServer.AutoConfirmationEnabled || false,
  );
  const [AutoRegistrationEnabled, setAutoRegistrationEnabled] = useState(
    RegistrationMode === 'private' ? false : appData.AdServer.AutoRegistrationEnabled || false,
  );
  const [DefaultUserRoles, setDefaultUserRoles] = useState(appData.AdServer.DefaultUserRoles || []);
  const form = useForm({
    initialFields: {
      AdvertiserApplyFormUrl: appData.AdServer.AdvertiserApplyFormUrl || '',
      PublisherApplyFormUrl: appData.AdServer.PublisherApplyFormUrl || '',
    },
    validation: {
      AdvertiserApplyFormUrl: ['url'],
      PublisherApplyFormUrl: ['url'],
    },
  });
  const { createErrorNotification, createSuccessNotification } = useCreateNotification();

  const handleSelectChange = (event) => {
    setRegistrationMode(event.target.value);
  };

  const handleRolesChange = (e) => {
    setDefaultUserRoles(() => {
      if (e.target.value === 'advertiser') {
        return ['advertiser'];
      }
      if (e.target.value === 'publisher') {
        return ['publisher'];
      }
      if (e.target.value === 'both') {
        return ['advertiser', 'publisher'];
      }
    });
  };

  const onSaveClick = async () => {
    if (RegistrationMode === 'private') {
      setEmailVerificationRequired(false);
      setAutoRegistrationEnabled(false);
      setAutoConfirmationEnabled(false);
    }
    const body = {
      DefaultUserRoles: DefaultUserRoles.length ? DefaultUserRoles : null,
      ...(RegistrationMode === 'public' && {
        RegistrationMode,
        EmailVerificationRequired,
        AutoConfirmationEnabled,
        AutoRegistrationEnabled,
      }),
      ...(RegistrationMode === 'restricted' && {
        RegistrationMode,
        EmailVerificationRequired,
        AutoConfirmationEnabled,
        AutoRegistrationEnabled,
        AdvertiserApplyFormUrl: form.fields.AdvertiserApplyFormUrl || null,
        PublisherApplyFormUrl: form.fields.PublisherApplyFormUrl || null,
      }),
      ...(RegistrationMode === 'private' && {
        RegistrationMode,
        EmailVerificationRequired: false,
        AutoConfirmationEnabled: false,
        AutoRegistrationEnabled: false,
      }),
    };

    try {
      const response = await setRegistrationModeConfig(body).unwrap();
      dispatch(changeRegistrationModeInformation(response.data));
      createSuccessNotification();
    } catch (err) {
      createErrorNotification(err);
    }
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Registration mode" subheader="Lorem ipsum dolor sit amet, consectetur adipisicing elit." />

      <CardContent className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
        <Box className={commonStyles.halfCard}>
          <FormControl fullWidth>
            <InputLabel id="registrationModeLabel">Set registration mode</InputLabel>
            <Select
              size="small"
              labelId="registrationModeLabel"
              id="registrationMode"
              value={RegistrationMode}
              label="Set registration mode"
              onChange={handleSelectChange}
            >
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="restricted">Restricted</MenuItem>
              <MenuItem value="private">Private</MenuItem>
            </Select>
          </FormControl>
          <Collapse in={RegistrationMode === 'restricted'} timeout="auto">
            <Box component="form" onChange={form.onChange} onFocus={form.setTouched}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                margin="dense"
                label="Advertiser apply form URL"
                name="AdvertiserApplyFormUrl"
                error={form.touchedFields.AdvertiserApplyFormUrl && !form.errorObj.AdvertiserApplyFormUrl.isValid}
                helperText={form.touchedFields.AdvertiserApplyFormUrl && form.errorObj.AdvertiserApplyFormUrl.helperText}
                value={form.fields.AdvertiserApplyFormUrl}
                inputProps={{ autoComplete: 'off' }}
              />
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                margin="dense"
                label="Publisher apply form URL"
                name="PublisherApplyFormUrl"
                error={form.touchedFields.PublisherApplyFormUrl && !form.errorObj.PublisherApplyFormUrl.isValid}
                helperText={form.touchedFields.PublisherApplyFormUrl && form.errorObj.PublisherApplyFormUrl.helperText}
                value={form.fields.PublisherApplyFormUrl}
                inputProps={{ autoComplete: 'off' }}
              />
            </Box>
          </Collapse>

          <Collapse in={RegistrationMode !== 'private'} timeout="auto">
            <FormControl>
              <FormControlLabel
                label="E-mail verification required"
                control={
                  <Checkbox checked={EmailVerificationRequired} onChange={() => setEmailVerificationRequired((prevState) => !prevState)} />
                }
              />
              <FormControlLabel
                label="Auto account confirmation"
                control={
                  <Checkbox checked={AutoConfirmationEnabled} onChange={() => setAutoConfirmationEnabled((prevState) => !prevState)} />
                }
              />
              <FormControlLabel
                label="Auto registration allowed"
                control={
                  <Checkbox checked={AutoRegistrationEnabled} onChange={() => setAutoRegistrationEnabled((prevState) => !prevState)} />
                }
              />
            </FormControl>
          </Collapse>
          <FormControl sx={{ mt: 1 }}>
            <FormLabel focused={false} sx={{ whiteSpace: 'nowrap' }}>
              Default users role:
            </FormLabel>
            <RadioGroup
              row
              value={(() => {
                if (DefaultUserRoles.length === 2) {
                  return 'both';
                }
                return DefaultUserRoles[0];
              })()}
              onChange={handleRolesChange}
            >
              <FormControlLabel value="advertiser" control={<Radio />} label="Advertiser" />
              <FormControlLabel value="publisher" control={<Radio />} label="Publisher" />
              <FormControlLabel value="both" control={<Radio />} label="Both" />
            </RadioGroup>
          </FormControl>
          <Collapse in={AutoRegistrationEnabled && !DefaultUserRoles.includes('publisher')} timeout="auto">
            <Alert severity="warning">No publisher role while auto registration is allowed.</Alert>
          </Collapse>
        </Box>
      </CardContent>

      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button
            disabled={
              isLoading ||
              (appData.AdServer.RegistrationMode === RegistrationMode &&
                appData.AdServer.EmailVerificationRequired === EmailVerificationRequired &&
                appData.AdServer.AutoConfirmationEnabled === AutoConfirmationEnabled &&
                appData.AdServer.AutoRegistrationEnabled === AutoRegistrationEnabled &&
                compareArrays(appData.AdServer.DefaultUserRoles, DefaultUserRoles) &&
                (RegistrationMode === 'restricted' ? !form.isFormValid || !form.isFormWasChanged : true))
            }
            onClick={onSaveClick}
            variant="contained"
            type="button"
          >
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

const AutoWithdrawalCard = () => {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setAutoWithdrawalConfig, { isLoading }] = useSetAutoWithdrawalConfigMutation();
  const form = useForm({
    initialFields: {
      AutoWithdrawalLimitAds: clicksToAds(appData.AdServer.AutoWithdrawalLimitAds || 0).toString(),
      AutoWithdrawalLimitBsc: clicksToAds(appData.AdServer.AutoWithdrawalLimitBsc || 0).toString(),
    },
    validation: {
      AutoWithdrawalLimitAds: ['number'],
      AutoWithdrawalLimitBsc: ['number'],
    },
  });
  const { createErrorNotification, createSuccessNotification } = useCreateNotification();

  const onSaveClick = async () => {
    const body = {};
    Object.keys(form.changedFields).forEach((field) => {
      if (form.changedFields[field]) {
        body[field] = adsToClicks(returnNumber(form.fields[field]));
      }
    });

    try {
      const response = await setAutoWithdrawalConfig(body).unwrap();
      dispatch(changeAutoWithdrawalConfigInformation(response.data));
      createSuccessNotification();
    } catch (err) {
      createErrorNotification(err);
    }
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Auto withdrawal" subheader="Lorem ipsum dolor sit amet, consectetur adipisicing elit." />

      <CardContent className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
        <Box
          component="form"
          onChange={form.onChange}
          onFocus={form.setTouched}
          className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn} ${commonStyles.alignCenter}`}
        >
          <FormControl error={form.touchedFields.AutoWithdrawalLimitAds && !form.errorObj.AutoWithdrawalLimitAds.isValid} margin="dense">
            <InputLabel htmlFor="AutoWithdrawalLimitAds">ADS minimum withdrawal</InputLabel>
            <OutlinedInput
              id="AutoWithdrawalLimitAds"
              name="AutoWithdrawalLimitAds"
              size="small"
              type="number"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              label="ADS minimum withdrawal"
              value={setDecimalPlaces(form.fields.AutoWithdrawalLimitAds, 2)}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
            <FormHelperText id="CampaignMinBudget">
              {form.touchedFields.AutoWithdrawalLimitAds && form.errorObj.AutoWithdrawalLimitAds.helperText}
            </FormHelperText>
          </FormControl>
          <FormControl error={form.touchedFields.AutoWithdrawalLimitBsc && !form.errorObj.AutoWithdrawalLimitBsc.isValid} margin="dense">
            <InputLabel htmlFor="AutoWithdrawalLimitBsc">BSC minimum withdrawal</InputLabel>
            <OutlinedInput
              id="AutoWithdrawalLimitBsc"
              name="AutoWithdrawalLimitBsc"
              size="small"
              type="number"
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
              label="BSC minimum withdrawal"
              value={setDecimalPlaces(form.fields.AutoWithdrawalLimitBsc, 2)}
              inputProps={{ autoComplete: 'off', min: 0 }}
            />
            <FormHelperText id="CampaignMinBudget">
              {form.touchedFields.AutoWithdrawalLimitBsc && form.errorObj.AutoWithdrawalLimitBsc.helperText}
            </FormHelperText>
          </FormControl>
        </Box>
      </CardContent>

      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button
            disabled={isLoading || !form.isFormWasChanged || !form.isFormValid}
            onClick={onSaveClick}
            variant="contained"
            type="button"
          >
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

const PrivacyCard = () => {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setRegulationsConfig, { isLoading }] = useSetRegulationsConfigMutation();
  const form = useForm({
    initialFields: {
      PrivacyPolicy: appData.AdServer.PrivacyPolicy || '',
    },
  });
  const { createErrorNotification, createSuccessNotification } = useCreateNotification();

  const onSaveClick = async () => {
    const body = {
      ...(form.changedFields.PrivacyPolicy ? { PrivacyPolicy: form.fields.PrivacyPolicy } : {}),
    };

    try {
      const response = await setRegulationsConfig(body).unwrap();
      dispatch(changeRegulationsInformation(response.data));
      createSuccessNotification();
    } catch (err) {
      createErrorNotification(err);
    }
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Privacy" subheader="Here you can read and edit your privacy settings" />
      <CardContent>
        <Box component="form" onChange={form.onChange} onFocus={form.setTouched}>
          <TextField value={form.fields.PrivacyPolicy} name="PrivacyPolicy" fullWidth multiline rows={8} label="Privacy" />
        </Box>
      </CardContent>
      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button disabled={isLoading || !form.isFormWasChanged} onClick={onSaveClick} variant="contained" type="button">
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

const TermAndConditionCard = () => {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setRegulationsConfig, { isLoading }] = useSetRegulationsConfigMutation();
  const form = useForm({
    initialFields: {
      Terms: appData.AdServer.Terms || '',
    },
  });
  const { createErrorNotification, createSuccessNotification } = useCreateNotification();

  const onSaveClick = async () => {
    const body = {
      ...(form.changedFields.Terms ? { Terms: form.fields.Terms } : {}),
    };

    try {
      const response = await setRegulationsConfig(body).unwrap();
      dispatch(changeRegulationsInformation(response.data));
      createSuccessNotification();
    } catch (err) {
      createErrorNotification(err);
    }
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Terms and conditions" subheader="Here you can read and edit your terms and conditions" />
      <CardContent>
        <Box component="form" onChange={form.onChange} onFocus={form.setTouched}>
          <TextField value={form.fields.Terms} name="Terms" fullWidth multiline rows={8} label="Terms and conditions" />
        </Box>
      </CardContent>
      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button disabled={isLoading || !form.isFormWasChanged} onClick={onSaveClick} variant="contained" type="button">
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};
