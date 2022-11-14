import React, { useMemo, useState } from 'react';
import { useGetEventsQuery } from '../../redux/monitoring/monitoringApi';
import TableData from '../../Components/TableData/TableData';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import commonStyles from '../../styles/commonStyles.scss';

const headCells = [
  {
    id: 'type',
    label: 'Type',
    cellWidth: '15rem',
    alignContent: 'center',
    filterableBy: ['select'],
    possibleSelectionOptions: [
      'BroadcastSent',
      'ExchangeRatesFetched',
      'FilteringUpdated',
      'HostBroadcastProcessed',
      'InventorySynchronized',
      'SiteRankUpdated',
      'TargetingUpdated',
    ],
  },
  {
    id: 'createdAt',
    label: 'Date of occurrence',
    cellWidth: '15rem',
    alignContent: 'center',
    filterableBy: ['date'],
  },
  {
    id: 'properties',
    label: 'Properties',
    cellWidth: '15rem',
    alignContent: 'center',
  },
];

export default function Events() {
  const [queryConfig, setQueryConfig] = useState({
    limit: 10,
    cursor: null,
    page: 1,
    'filter[type]': null,
    'filter[createdAt][from]': null,
    'filter[createdAt][to]': null,
  });
  const { data: response, isFetching } = useGetEventsQuery(queryConfig, { refetchOnMountOrArgChange: true });

  const rows = useMemo(() => {
    const events = response?.data || [];
    return events.map((event) => ({
      id: event.id,
      type: event.type,
      createdAt: new Date(event.createdAt).toLocaleString(),
      properties: <PropertiesDialog data={event} />,
    }));
  }, [response]);

  const handleTableChanges = (event) => {
    const fromDate = event.tableFilters.dateRange?.createdAt?.from || null;
    const toDate = event.tableFilters.dateRange?.createdAt?.to || null;

    const formatDate = (date) => {
      if (!date) {
        return null;
      }
      return new Date(date.getTime()).toISOString().split('.')[0] + 'Z';
    };

    setQueryConfig((prevState) => ({
      ...prevState,
      cursor: event.page === 1 ? null : response.cursor,
      page: event.page,
      limit: event.rowsPerPage,
      'filter[type]': event.tableFilters.select?.type || null,
      'filter[createdAt][from]': formatDate(fromDate),
      'filter[createdAt][to]': formatDate(toDate),
    }));
  };

  return (
    <Card
      className={`${commonStyles.card}`}
      sx={{
        height: 'calc(100vh - 9rem)',
        // maxWidth: 'calc(100vw - 21rem)',
      }}
      width="full"
    >
      <CardHeader title="Events" />
      <CardContent sx={{ height: 'calc(100% - 4rem)' }}>
        <TableData
          headCells={headCells}
          rows={rows}
          onTableChange={handleTableChanges}
          isDataLoading={isFetching}
          defaultSortBy="type"
          paginationParams={{
            limit: queryConfig.limit,
            count: response?.total || 0,
            showFirstButton: true,
            showLastButton: true,
          }}
        />
      </CardContent>
    </Card>
  );
}

const PropertiesDialog = ({ data }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="text" onClick={() => setOpen(true)}>
        Details
      </Button>
      <Dialog fullWidth maxWidth="sm" open={open} onClose={() => setOpen(false)}>
        <DialogTitle component="div" className={`${commonStyles.flex} ${commonStyles.justifySpaceBetween} ${commonStyles.alignCenter}`}>
          <Typography variant="h6">Details</Typography>
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="none" align="center" sx={{ pt: 1, pb: 1 }}>
                  Type
                </TableCell>
                <TableCell padding="none" align="center" sx={{ pt: 1, pb: 1 }}>
                  Date of occurrence
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell padding="none" align="center" sx={{ pt: 1, pb: 1 }}>
                  {data.type}
                </TableCell>
                <TableCell padding="none" align="center" sx={{ pt: 1, pb: 1 }}>
                  {new Date(data.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Box sx={{ backgroundColor: '#f6f6f6', padding: 1, borderRadius: 1, maxHeight: '400px', overflow: 'auto' }}>
            <Typography component="pre" variant="body2">
              {JSON.stringify(data.properties, null, 2)}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
