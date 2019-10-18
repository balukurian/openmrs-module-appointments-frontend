import React, {Fragment, useState} from "react";
import classNames from 'classnames';
import {
    appointmentEditor,
    searchFieldsContainer,
    searchFieldsContainerLeft,
    searchFieldsContainerRight
} from './AppointmentEditor.module.scss';
import PatientSearch from "../PatientSearch/PatientSearch.jsx";
import ServiceSearch from "../Service/ServiceSearch.jsx";
import ServiceTypeSearch from "../Service/ServiceTypeSearch.jsx";
import ProviderSearch from "../Provider/ProviderSearch.jsx";
import LocationSearch from "../Location/LocationSearch.jsx";
import SpecialitySearch from "../Speciality/SpecialitySearch.jsx";
import ErrorMessage from "../ErrorMessage/ErrorMessage.jsx";
import AppointmentEditorFooter from "../AppointmentEditorFooter/AppointmentEditorFooter.jsx";
import {injectIntl} from "react-intl";
import PropTypes from "prop-types";
import {saveAppointment} from "./AppointmentEditorService";
import Label from '../Label/Label.jsx';
import { getDateTime, isStartTimeBeforeEndTime } from '../../utils/DateUtil.js'
import DateSelector from "../DateSelector/DateSelector.jsx";
import TimeSelector from "../TimeSelector/TimeSelector.jsx";
import AppointmentNotes from "../AppointmentNotes/AppointmentNotes.jsx";

const AppointmentEditor = props => {
    const [patient, setPatient] = useState();
    const [patientError, setPatientError] = useState(false);
    const [serviceError, setServiceError] = useState(false);
    const [dateError, setDateError] = useState(false);
    const [startTimeError, setStartTimeError] = useState(false);
    const [endTimeError, setEndTimeError] = useState(false);
    const [startTimeBeforeEndTimeError, setStartTimeBeforeEndTimeError] = useState(false);
    const [providers, setProviders] = useState([]);
    const [service, setService] = useState('');
    const [serviceType, setServiceType] = useState('');
    const [location, setLocation] = useState('');
    const [speciality, setSpeciality] = useState('');
    const [startDate, setStartDate] = useState();
    const [startTime, setStartTime] = useState();
    const [endTime, setEndTime] = useState();
    const {appConfig} = props;
    const [notes, setNotes] = useState();

    const {intl} = props;

    const isSpecialitiesEnabled = () => {
        if (appConfig)
            return appConfig.enableSpecialities;
        return false;
    };

    const maxAppointmentProvidersAllowed = () => {
        if (appConfig && appConfig.maxAppointmentProviders)
            return appConfig.maxAppointmentProviders;
        return 1;
    };

    const patientErrorMessage = intl.formatMessage({
        id: 'PATIENT_ERROR_MESSAGE', defaultMessage: 'Please select patient'
    });

    const serviceErrorMessage = intl.formatMessage({
        id: 'SERVICE_ERROR_MESSAGE', defaultMessage: 'Please select service'
    });

    const dateErrorMessage = intl.formatMessage({
        id: 'DATE_ERROR_MESSAGE', defaultMessage: 'Please select date'
    });

    const timeErrorMessage = intl.formatMessage({
        id: 'TIME_ERROR_MESSAGE', defaultMessage: 'Please select time'
    });

    const startTimeLessThanEndTimeMessage = intl.formatMessage({
        id: 'START_TIME_LESSTHAN_END_TME_ERROR_MESSAGE', defaultMessage: 'From time should be before to time'
    });


    const getAppointment = () => {
        let appointment = {
            patientUuid: patient && patient.uuid,
            serviceUuid: service,
            serviceTypeUuid: serviceType,
            startDateTime: getDateTime(startDate, startTime),
            endDateTime: getDateTime(startDate, endTime),
            providers: providers,
            locationUuid: location,
            appointmentKind: "Scheduled",
            comments: notes
        };
        if (!appointment.serviceTypeUuid || appointment.serviceTypeUuid.length < 1)
            delete appointment.serviceTypeUuid;
        return appointment;
    };

    const isValidAppointment = () => {
        const isValidPatient = patient && patient.uuid;
        const startTimeBeforeEndTime = isStartTimeBeforeEndTime(startTime, endTime);
        setPatientError(!isValidPatient);
        setServiceError(!service);
        setDateError(!startDate);
        setStartTimeError(!startTime);
        setEndTimeError(!endTime);
        setStartTimeBeforeEndTimeError(!startTimeBeforeEndTime);
        return isValidPatient && service && startDate && startTime && endTime && startTimeBeforeEndTime;
    };

    const checkAndSave = async () => {
        if (isValidAppointment()) {
            const appointment = getAppointment();
            await saveAppointment(appointment);
        }
    };


    const appointmentDateProps = {
        translationKey: 'APPOINTMENT_DATE_LABEL', defaultValue: 'Appointment date'
    };

    const appointmentStartTimeProps = {
        translationKey: 'APPOINTMENT_TIME_FROM_LABEL', defaultValue: 'From',
        timeSelectionTranslationKey: 'CHOOSE_TIME_PLACE_HOLDER', timeSelectionDefaultValue: 'Enter time as hh:mm am/pm',
    };

    const appointmentEndTimeProps = {
        translationKey: 'APPOINTMENT_TIME_TO_LABEL', defaultValue: 'To',
        timeSelectionTranslationKey: 'CHOOSE_TIME_PLACE_HOLDER', timeSelectionDefaultValue: 'Enter time as hh:mm am/pm',
    };


    return (<Fragment>
        <div data-testid="appointment-editor" className={classNames(appointmentEditor)}>
            <div className={classNames(searchFieldsContainer)}>
                <div className={classNames(searchFieldsContainerLeft)}>
                    <div>
                        <PatientSearch onChange={(optionSelected) => {
                            setPatient(optionSelected.value);
                            setPatientError(!optionSelected.value);
                        }} data-testid="patient-search"/>
                        <ErrorMessage message={patientError ? patientErrorMessage : undefined}
                                      data-testid="patient-error-message"/>
                    </div>
                    <div>
                        <ServiceSearch onChange={(optionSelected) => {
                            setService(optionSelected.value);
                            setServiceError(!optionSelected.value)
                        }}
                                       specialityUuid={speciality} data-testid="service-search"/>
                        <ErrorMessage message={serviceError ? serviceErrorMessage : undefined}
                                      data-testid="service-error-message"/>
                    </div>
                    <div>
                        <ServiceTypeSearch onChange={(optionSelected) => setServiceType(optionSelected.value)}
                                           serviceUuid={service} data-testid="service-type-search"/>
                    </div>
                    {isSpecialitiesEnabled() ?
                        <div>
                            <SpecialitySearch onChange={(optionSelected) => setSpeciality(optionSelected.value)}
                                              data-testid="speciality-search"/>
                        </div> : null
                    }
                    <div>
                        <LocationSearch onChange={(optionSelected) => setLocation(optionSelected.value)}
                                        data-testid="location-search"/>
                        <ErrorMessage message={undefined}/>
                    </div>
                </div>
                <div className={classNames(searchFieldsContainerRight)}>
                    <ProviderSearch onChange={selectedProviders => setProviders(selectedProviders)}
                                    maxAppointmentProvidersAllowed={maxAppointmentProvidersAllowed()}
                                    data-testid="provider-search"/>
                </div>
            </div>
            <div className={classNames(searchFieldsContainer)}>
                <div className={classNames(searchFieldsContainerLeft)}>
                    <div>
                        <DateSelector {...appointmentDateProps} onChange={date => {
                            setStartDate(date);
                            setDateError(!date)
                        }} onClear={() => {
                            setStartDate(undefined);
                        }}/>
                        <ErrorMessage message={dateError ? dateErrorMessage : undefined} data-testid="date-error-message"/>
                    </div>
                    <div>
                        <Label translationKey="APPOINTMENT_TIME_LABEL" defaultValue="Choose a time slot"/>
                        <div>
                            <TimeSelector {...appointmentStartTimeProps}
                                          onChange={time => {
                                              setStartTime(time);
                                              setStartTimeBeforeEndTimeError(!isStartTimeBeforeEndTime(time, endTime));
                                          }}/>
                            <ErrorMessage message={startTimeError ? timeErrorMessage : undefined} data-testid="start-time-error-message"/>
                        </div>
                        <div>
                            <TimeSelector {...appointmentEndTimeProps}
                                          onChange={time => {
                                              setEndTime(time);
                                              setStartTimeBeforeEndTimeError(!isStartTimeBeforeEndTime(startTime, time));
                                          }}/>
                            <ErrorMessage message={endTimeError ? timeErrorMessage : undefined} data-testid="end-time-error-message"/>
                        </div>
                        <ErrorMessage message={startTime && endTime && startTimeBeforeEndTimeError ? startTimeLessThanEndTimeMessage : undefined}
                                      data-testid="start-time-after-end-time-error-message"/>
                    </div>
                </div>
                <div className={classNames(searchFieldsContainerRight)}>
                    <Label translationKey="APPOINTMENT_NOTES" defaultValue="Notes"/>
                    <AppointmentNotes onChange={(event) => setNotes(event.target.value)}/>
                </div>
            </div>
            <AppointmentEditorFooter checkAndSave={checkAndSave}/>
        </div>
    </Fragment>);
};

AppointmentEditor.propTypes = {
    intl: PropTypes.object.isRequired,
    appConfigs: PropTypes.object
};

export default injectIntl(AppointmentEditor);
