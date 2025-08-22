"use client";

import { useEffect, useMemo, useState } from 'react';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Container, 
  Paper, 
  Stack, 
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Fade,
  Zoom,
  Alert,
  Divider
} from '@mui/material';
import { 
  Refresh, 
  Casino, 
  People, 
  Person,
  Email,
  Phone,
  Business,
  Star
} from '@mui/icons-material';

type Usuario = {
  id?: string | number;
  nome?: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  avatar?: string | null;
  avatar_url?: string;
  [key: string]: any;
};

export default function SorteioPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selecionado, setSelecionado] = useState<Usuario | null>(null);
  const [sorting, setSorting] = useState<boolean>(false);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelecionado(null);
      const res = await fetch('/api/usuarios', { cache: 'no-store' });
      if (!res.ok) {
        let msg = 'Falha ao carregar usuários';
        try {
          const j = await res.json();
          msg = j?.message || j?.error || msg;
        } catch {}
        throw new Error(msg);
      }
      const data = await res.json();
      const list: Usuario[] = Array.isArray(data)
        ? data
        : (data?.usuarios || data?.items || data?.data || []);
      setUsuarios(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setError(e?.message || 'Erro ao buscar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const podeSortear = useMemo(() => usuarios.length > 0, [usuarios]);

  const sortear = async () => {
    if (!podeSortear) return;
    
    setSorting(true);
    setSelecionado(null);
    
    // Simular animação de sorteio
    const sorteios = [];
    for (let i = 0; i < 8; i++) {
      const idx = Math.floor(Math.random() * usuarios.length);
      sorteios.push(usuarios[idx]);
    }
    
    // Mostrar diferentes usuários rapidamente
    for (let i = 0; i < sorteios.length; i++) {
      setSelecionado(sorteios[i]);
      await new Promise(resolve => setTimeout(resolve, 120 + i * 30));
    }
    
    // Resultado final
    const idx = Math.floor(Math.random() * usuarios.length);
    setSelecionado(usuarios[idx]);
    setSorting(false);
  };

  const formatarTelefone = (tel: string) => {
    if (!tel) return '-';
    const cleaned = tel.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,6)}-${cleaned.slice(6)}`;
    }
    return tel;
  };

  const getAvatarSrc = (usuario: Usuario): string | undefined => {
    const src = usuario.avatar_url || usuario.avatar;
    return src || undefined;
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: '#fafafa',
      py: 6
    }}>
      <Container maxWidth="xl">
        <Stack spacing={6}>
          {/* Header */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" sx={{ 
              fontWeight: 300, 
              mb: 2,
              color: '#1a1a1a',
              letterSpacing: '-0.02em'
            }}>
              Sorteio de Usuários
            </Typography>
            <Typography variant="h6" sx={{ 
              color: '#666',
              fontWeight: 400,
              maxWidth: 600,
              mx: 'auto'
            }}>
              Escolha um usuário aleatório da nossa base de dados
            </Typography>
          </Box>

          {/* Stats & Actions */}
          <Paper elevation={0} sx={{ 
            p: 4, 
            background: 'white',
            borderRadius: 4,
            border: '1px solid #e0e0e0'
          }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <People sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 300, color: '#1a1a1a', mb: 1 }}>
                    {usuarios.length}
                  </Typography>
                  <Typography variant="body1" color="#666">
                    Usuários Cadastrados
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                  <Button 
                    variant="outlined" 
                    onClick={fetchUsuarios} 
                    disabled={loading}
                    size="large"
                    startIcon={<Refresh />}
                    sx={{ 
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      borderColor: '#667eea',
                      color: '#667eea',
                      borderWidth: 2,
                      '&:hover': {
                        borderColor: '#5a6fd8',
                        backgroundColor: 'rgba(102, 126, 234, 0.04)'
                      }
                    }}
                  >
                    {loading ? 'Carregando...' : 'Atualizar Lista'}
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={sortear} 
                    disabled={!podeSortear || loading || sorting}
                    size="large"
                    startIcon={sorting ? <CircularProgress size={20} /> : <Casino />}
                    sx={{ 
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        boxShadow: '0 6px 25px rgba(102, 126, 234, 0.4)'
                      }
                    }}
                  >
                    {sorting ? 'Sorteando...' : '🎲 Sortear'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Error Alert */}
          {error && (
            <Fade in={!!error}>
              <Alert severity="error" sx={{ borderRadius: 3 }}>
                {error}
              </Alert>
            </Fade>
          )}

          {/* Loading */}
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center',
              py: 12
            }}>
              <CircularProgress size={60} sx={{ color: '#667eea', mb: 3 }} />
              <Typography variant="h6" color="#666">Carregando usuários...</Typography>
            </Box>
          ) : (
            <>
              {/* Winner Card */}
              {selecionado && (
                <Zoom in={!!selecionado}>
                  <Paper elevation={0} sx={{ 
                    p: 5, 
                    background: 'linear-gradient(135deg, #fff 0%, #f8f9ff 100%)',
                    borderRadius: 4,
                    border: '2px solid #667eea',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ 
                      position: 'absolute', 
                      top: -30, 
                      right: -30, 
                      fontSize: 120,
                      opacity: 0.05,
                      color: '#667eea'
                    }}>
                      ⭐
                    </Box>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
                      <Avatar 
                        src={getAvatarSrc(selecionado)} 
                        sx={{ 
                          width: 100, 
                          height: 100, 
                          fontSize: 36,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: '4px solid white',
                          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        {selecionado.nome?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar>
                      <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                        <Chip 
                          label="🏆 Vencedor do Sorteio!" 
                          sx={{ 
                            mb: 3,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '1rem',
                            py: 1
                          }}
                        />
                        <Typography variant="h4" sx={{ fontWeight: 300, mb: 3, color: '#1a1a1a' }}>
                          {selecionado.nome || 'Nome não informado'}
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Email sx={{ color: '#667eea', fontSize: 20 }} />
                              <Box>
                                <Typography variant="caption" color="#666" sx={{ display: 'block' }}>
                                  Email
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {selecionado.email || 'Email não informado'}
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Phone sx={{ color: '#667eea', fontSize: 20 }} />
                              <Box>
                                <Typography variant="caption" color="#666" sx={{ display: 'block' }}>
                                  Telefone
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {formatarTelefone(selecionado.telefone || '')}
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid item xs={12}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Business sx={{ color: '#667eea', fontSize: 20 }} />
                              <Box>
                                <Typography variant="caption" color="#666" sx={{ display: 'block' }}>
                                  Empresa
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {selecionado.empresa || 'Empresa não informada'}
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>
                        </Grid>
                      </Box>
                    </Stack>
                  </Paper>
                </Zoom>
              )}

              {/* Users Grid */}
              <Paper elevation={0} sx={{ 
                p: 4, 
                background: 'white',
                borderRadius: 4,
                border: '1px solid #e0e0e0'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 400, mb: 4, textAlign: 'center', color: '#1a1a1a' }}>
                  Lista de Usuários ({usuarios.length})
                </Typography>
                
                {usuarios.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <People sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" color="#666">
                      Nenhum usuário encontrado
                    </Typography>
                    <Typography variant="body2" color="#999">
                      Cadastre alguns usuários primeiro para poder fazer o sorteio
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {usuarios.map((usuario, index) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={usuario.id || index}>
                        <Fade in={true} timeout={300 + index * 100}>
                          <Card 
                            elevation={0}
                            sx={{ 
                              height: '100%',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer',
                              border: selecionado && (selecionado.id === usuario.id || selecionado.email === usuario.email) 
                                ? '2px solid #667eea' 
                                : '1px solid #f0f0f0',
                              borderRadius: 3,
                              background: selecionado && (selecionado.id === usuario.id || selecionado.email === usuario.email)
                                ? 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)'
                                : 'white',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                                borderColor: '#667eea'
                              }
                            }}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Stack spacing={3}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Chip 
                                    label={`#${index + 1}`} 
                                    size="small" 
                                    sx={{ 
                                      background: '#f0f0f0',
                                      color: '#666',
                                      fontWeight: 500,
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                  {selecionado && (selecionado.id === usuario.id || selecionado.email === usuario.email) && (
                                    <Chip 
                                      label="🏆 Vencedor" 
                                      size="small" 
                                      sx={{ 
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '0.75rem'
                                      }}
                                    />
                                  )}
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                  <Avatar 
                                    src={getAvatarSrc(usuario)}
                                    sx={{ 
                                      width: 60, 
                                      height: 60,
                                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                      fontSize: '1.5rem',
                                      fontWeight: 500
                                    }}
                                  >
                                    {usuario.nome?.charAt(0)?.toUpperCase() || 'U'}
                                  </Avatar>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 0.5 }}>
                                      {usuario.nome || 'Nome não informado'}
                                    </Typography>
                                    <Typography variant="body2" color="#666">
                                      {usuario.empresa || 'Empresa não informada'}
                                    </Typography>
                                  </Box>
                                </Box>

                                <Divider sx={{ opacity: 0.3 }} />

                                <Stack spacing={2}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Email sx={{ fontSize: 18, color: '#667eea' }} />
                                    <Typography variant="body2" noWrap sx={{ color: '#666' }}>
                                      {usuario.email || 'Email não informado'}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Phone sx={{ fontSize: 18, color: '#667eea' }} />
                                    <Typography variant="body2" sx={{ color: '#666' }}>
                                      {formatarTelefone(usuario.telefone || '')}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Fade>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
} 