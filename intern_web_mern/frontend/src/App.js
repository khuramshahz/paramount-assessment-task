
import React, { useEffect, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Container, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Select, MenuItem, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, IconButton, Box, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
// Set document title for branding
if (typeof document !== 'undefined') {
  document.title = 'Paramount Intelligence Intern Assessment';
}

const API_URL = 'http://localhost:5000/api/interns';

const roles = ['Frontend', 'Backend', 'Fullstack'];
const statuses = ['Applied', 'Interviewing', 'Hired', 'Rejected'];

function InternForm({ onSubmit, initial, loading, error, onCancel }) {
  const [form, setForm] = useState(
    initial || { name: '', email: '', role: '', status: '', score: '' }
  );
  const [clientError, setClientError] = useState('');

  function validate() {
    if (!form.name || form.name.length < 2) return 'Name min 2 chars';
    if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'Invalid email';
    if (!roles.includes(form.role)) return 'Select a valid role';
    if (!statuses.includes(form.status)) return 'Select a valid status';
    if (form.score === '' || isNaN(form.score) || form.score < 0 || form.score > 100) return 'Score 0-100';
    return '';
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) return setClientError(err);
    setClientError('');
    onSubmit(form);
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
      <TextField name="name" label="Name" value={form.name} onChange={handleChange} required fullWidth inputProps={{ minLength: 2 }} />
      <TextField name="email" label="Email" value={form.email} onChange={handleChange} required fullWidth type="email" />
      <FormControl fullWidth required>
        <InputLabel>Role</InputLabel>
        <Select name="role" value={form.role} label="Role" onChange={handleChange}>
          <MenuItem value=""><em>None</em></MenuItem>
          {roles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl fullWidth required>
        <InputLabel>Status</InputLabel>
        <Select name="status" value={form.status} label="Status" onChange={handleChange}>
          <MenuItem value=""><em>None</em></MenuItem>
          {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </Select>
      </FormControl>
      <TextField name="score" label="Score" value={form.score} onChange={handleChange} required fullWidth type="number" inputProps={{ min: 0, max: 100 }} />
      <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
        <Button type="submit" variant="contained" color="primary" disabled={loading} startIcon={<AddIcon />}>{loading ? 'Saving...' : 'Save'}</Button>
        {onCancel && <Button onClick={onCancel} variant="outlined">Cancel</Button>}
      </Box>
      {(clientError || error) && <Box sx={{ color: 'error.main', width: '100%' }}>{clientError || error}</Box>}
    </Box>
  );
}

function InternList() {
  const [interns, setInterns] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [apiError, setApiError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  function fetchInterns(page = 1) {
    setLoading(true);
    let url = `${API_URL}?page=${page}&limit=${pagination.limit}`;
    if (q) url += `&q=${encodeURIComponent(q)}`;
    if (role) url += `&role=${encodeURIComponent(role)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        setInterns(data.data);
        setPagination(data.pagination);
        setLoading(false);
      })
      .catch(() => {
        setApiError('Failed to load interns');
        setLoading(false);
      });
  }

  useEffect(() => { fetchInterns(1); }, [q, role, status]);

  function handleAdd(form) {
    setFormLoading(true);
    setFormError('');
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(async r => {
        if (!r.ok) throw await r.json();
        return r.json();
      })
      .then(() => {
        setFormOpen(false);
        fetchInterns(1);
      })
      .catch(e => setFormError(e?.error?.message || 'Error'))
      .finally(() => setFormLoading(false));
  }

  function handleEdit(form) {
    setFormLoading(true);
    setFormError('');
    fetch(`${API_URL}/${edit._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(async r => {
        if (!r.ok) throw await r.json();
        return r.json();
      })
      .then(() => {
        setEdit(null);
        fetchInterns(pagination.page);
      })
      .catch(e => setFormError(e?.error?.message || 'Error'))
      .finally(() => setFormLoading(false));
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this intern?')) return;
    setLoading(true);
    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      .then(r => {
        if (!r.ok && r.status !== 204) throw new Error('Delete failed');
        fetchInterns(pagination.page);
      })
      .catch(() => setApiError('Delete failed'))
      .finally(() => setLoading(false));
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Card sx={{ mb: 3, boxShadow: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <TextField label="Search name/email" value={q} onChange={e => setQ(e.target.value)} size="small" />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select value={role} label="Role" onChange={e => setRole(e.target.value)}>
                <MenuItem value="">All Roles</MenuItem>
                {roles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
                <MenuItem value="">All Statuses</MenuItem>
                {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setFormOpen(true); setEdit(null); }}>
              Add Intern
            </Button>
          </Box>
          {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box> : (
            <TableContainer component={Card} sx={{ boxShadow: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {interns.map(intern => (
                    <TableRow key={intern._id}>
                      <TableCell>{intern.name}</TableCell>
                      <TableCell>{intern.email}</TableCell>
                      <TableCell>{intern.role}</TableCell>
                      <TableCell>{intern.status}</TableCell>
                      <TableCell>{intern.score}</TableCell>
                      <TableCell>{(() => {
                        const val = intern.createdAt || intern.created;
                        if (!val) return '';
                        if (typeof val === 'string') {
                          const d = new Date(val);
                          return isNaN(d) ? val : d.toLocaleString();
                        }
                        if (typeof val === 'object' && val.$date) {
                          const d = new Date(val.$date);
                          return isNaN(d) ? val.$date : d.toLocaleString();
                        }
                        return '';
                      })()}</TableCell>
                      <TableCell>
                        <IconButton color="primary" onClick={() => setEdit(intern)}><EditIcon /></IconButton>
                        <IconButton color="error" onClick={() => handleDelete(intern._id)}><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <Button disabled={pagination.page === 1} onClick={() => fetchInterns(pagination.page - 1)}>Prev</Button>
            <Typography>Page {pagination.page} of {pagination.pages}</Typography>
            <Button disabled={pagination.page === pagination.pages} onClick={() => fetchInterns(pagination.page + 1)}>Next</Button>
          </Box>
          {apiError && <Snackbar open autoHideDuration={4000} message={apiError} action={<IconButton size="small" color="inherit" onClick={() => setApiError('')}><CloseIcon fontSize="small" /></IconButton>} onClose={() => setApiError('')} />}
        </CardContent>
      </Card>
      <Dialog open={formOpen || !!edit} onClose={() => { setFormOpen(false); setEdit(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>{edit ? 'Edit Intern' : 'Add Intern'}</DialogTitle>
        <DialogContent>
          <InternForm
            onSubmit={edit ? handleEdit : handleAdd}
            initial={edit}
            loading={formLoading}
            error={formError}
            onCancel={() => { setFormOpen(false); setEdit(null); }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f3f6fa' }}>
      <AppBar position="static" color="primary" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Paramount Intelligence Intern Assessment
          </Typography>
        </Toolbar>
      </AppBar>
      <InternList />
      <Box sx={{ bgcolor: '#1e293b', color: '#cbd5e1', textAlign: 'center', py: 2, mt: 6, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
        &copy; {new Date().getFullYear()} Paramount Intelligence. All rights reserved.
      </Box>
    </Box>
  );
}
