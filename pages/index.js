import { useState } from 'react';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Snackbar,
  IconButton,
  Box,
  Grid,
  Link
} from '@mui/material';
import {
  Facebook,
  Download,
  ErrorOutline,
  Close,
  Person
} from '@mui/icons-material';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
  textAlign: 'center',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 400,
  margin: '0 auto',
  marginTop: theme.spacing(4),
  boxShadow: theme.shadows[10],
  borderRadius: '12px',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: '8px',
}));

const ProfileImage = styled(CardMedia)({
  height: 300,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderTopLeftRadius: '12px',
  borderTopRightRadius: '12px',
});

export default function FacebookProfileScraper() {
  const [fbUrl, setFbUrl] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fbUrl) {
      setError('Please enter a Facebook profile URL');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    setProfileData(null);
    setError(null);

    try {
      const response = await axios.get('/api/scrape', {
        params: { fburl: fbUrl }
      });
      setProfileData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch profile data');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!profileData?.image) return;
    
    try {
      const response = await axios.get(profileData.image, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facebook-profile-${Date.now()}.jpg`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('Failed to download image');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <StyledContainer maxWidth="md">
      <Box mb={4}>
        <Facebook color="primary" sx={{ fontSize: 60 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Facebook Profile Scraper
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Fetch public profile picture and details from Facebook
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              label="Facebook Profile URL"
              placeholder="https://www.facebook.com/username"
              value={fbUrl}
              onChange={(e) => setFbUrl(e.target.value)}
              InputProps={{
                startAdornment: <Facebook color="action" sx={{ mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledButton
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Person />}
            >
              {loading ? 'Fetching...' : 'Get Profile'}
            </StyledButton>
          </Grid>
        </Grid>
      </form>

      {profileData && (
        <Box mt={4}>
          <StyledCard>
            {profileData.image && (
              <ProfileImage
                image={profileData.image}
                title={profileData.title}
              />
            )}
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2">
                {profileData.title || 'Facebook Profile'}
              </Typography>
              <StyledButton
                variant="contained"
                color="secondary"
                startIcon={<Download />}
                onClick={handleDownload}
                disabled={!profileData.image}
              >
                Download Image
              </StyledButton>
            </CardContent>
          </StyledCard>
        </Box>
      )}

      <Box mt={4}>
        <Typography variant="body2" color="textSecondary">
          Note: This tool only works with public Facebook profiles. Private profiles won't be accessible.
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          Developed by Tofazzal Hossain
        </Typography>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={error}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      />
    </StyledContainer>
  );
  }
