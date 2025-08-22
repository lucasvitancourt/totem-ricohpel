'use client';

import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
// Removido: import OpenAI do lado do cliente
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Stack, 
  Alert, 
  CircularProgress,
  Card,
  CardContent,
  TextField
} from '@mui/material';
import { 
  Business, 
  School, 
  Work, 
  TrendingUp, 
  Psychology, 
  Science,
  CameraAlt,
  Send,
  Refresh
} from '@mui/icons-material';

const WebcamCapture = () => {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  
  // Dados para captura de contato
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    interests: []
  });

  // Seleções das perguntas
  const [careerFocus, setCareerFocus] = useState<string>('');
  const [techInterest, setTechInterest] = useState<string>('');
  const [futureVision, setFutureVision] = useState<string>('');

  // Removido: API key diretamente no código
  // const API_KEY = '...';

  // Mapas para construção de prompt mais rico
  const careerProfiles: Record<string, { title: string; outfit: string; props: string; }> = {
    development: {
      title: 'software developer / engineer',
      outfit: 'smart-casual outfit (plain tee or shirt with light blazer), subtle tech wearable',
      props: 'subtle code editor reflections and UI hints in the background, no readable text'
    },
    data: {
      title: 'data scientist / analytics professional',
      outfit: 'business-casual outfit, minimal accessories',
      props: 'abstract dashboards, graphs and nodes in background, no readable text'
    },
    cloud: {
      title: 'cloud & devops engineer',
      outfit: 'smart-casual with utility jacket or polo',
      props: 'abstract cloud icons, network topology glow, subtle server rack bokeh'
    },
    business: {
      title: 'product & business professional',
      outfit: 'modern corporate blazer or suit without tie, clean look',
      props: 'product flow shapes and post-its abstracted, no readable text'
    }
  };

  const techFlair: Record<string, { palette: string; motifs: string; lighting: string; }> = {
    'ai-ml': {
      palette: 'cool purple-blue neon accents',
      motifs: 'AI circuitry micro-patterns and softly glowing neural node bokeh',
      lighting: 'soft studio light with subtle cool rim light'
    },
    blockchain: {
      palette: 'teal and emerald accents',
      motifs: 'hex-grid and chain-link abstract bokeh',
      lighting: 'crisp studio light with slight teal rim light'
    },
    iot: {
      palette: 'fresh green and sky blue accents',
      motifs: 'device silhouettes and signal waves softly blurred',
      lighting: 'natural soft key light with gentle warm fill'
    },
    cybersecurity: {
      palette: 'deep slate with red highlights',
      motifs: 'subtle lock and shield patterns in bokeh',
      lighting: 'dramatic but professional soft light with gentle red rim'
    }
  };

  const futureScenes: Record<string, { background: string; mood: string; }> = {
    remote: {
      background: 'modern home office with plants, wood textures and soft daylight through window (blurred bokeh)',
      mood: 'calm, focused, welcoming'
    },
    sustainability: {
      background: 'clean green-tech space with plants, sustainable materials and gentle daylight (blurred bokeh)',
      mood: 'eco-friendly, bright, optimistic'
    },
    collaboration: {
      background: 'global collaborative office with glass walls and abstract world map connection lines (blurred bokeh)',
      mood: 'diverse, energetic, connected'
    },
    innovation: {
      background: 'startup lab with neon gradients and holographic abstract shapes (blurred bokeh)',
      mood: 'bold, innovative, dynamic'
    }
  };

  const styleVariants = [
    'studio corporate headshot style',
    'semi-realistic stylized 3D portrait',
    'cinematic corporate portrait',
    'modern professional headshot'
  ];

  const buildAvatarPrompt = (career: string, tech: string, future: string) => {
    const c = careerProfiles[career] || {
      title: 'modern professional',
      outfit: 'smart-casual outfit',
      props: 'subtle abstract shapes'
    };
    const t = techFlair[tech] || {
      palette: 'neutral corporate palette',
      motifs: 'soft geometric shapes',
      lighting: 'balanced studio light'
    };
    const f = futureScenes[future] || {
      background: 'clean abstract studio background (blurred bokeh)',
      mood: 'professional, friendly'
    };

    const variant = styleVariants[Math.floor(Math.random() * styleVariants.length)];

    const identity = 'Preserve identity, face shape, hair and skin tone from the input photo.';
    const composition = 'Centered shoulders-up portrait, eye level, neutral friendly expression, 1024x1024.';
    const background = `Background based on choices: ${f.background} with ${t.motifs}, ${t.palette}. Depth-of-field bokeh, no text, no logos.`;
    const wardrobe = `Wardrobe: ${c.outfit}. Subtle professional accessories. Context props: ${c.props}.`;
    const artdir = `Style: ${variant}. ${t.lighting}. Soft key light and gentle rim light. High detail, clean skin, natural color.`;
    const safety = 'Avoid: distortions, extra limbs, artifacts, frames, watermarks, captions, embedded text.';

    return [
      `Create a high-quality 3D avatar portrait of the person as a ${c.title}.`,
      identity,
      wardrobe,
      background,
      artdir,
      composition,
      safety
    ].join(' ');
  };

  const steps = [
    'Foco de Carreira',
    'Interesse Tecnológico',
    'Visão do Futuro',
    'Gerar Avatar',
    'Seus Dados'
  ];

  const careerOptions = [
    {
      id: 'development',
      title: 'Desenvolvimento',
      description: 'Software, Web, Mobile, IA/ML',
      icon: '💻',
      color: 'var(--primary-blue)'
    },
    {
      id: 'data',
      title: 'Dados & Analytics',
      description: 'Big Data, BI, Ciência de Dados',
      icon: '📊',
      color: 'var(--primary-purple)'
    },
    {
      id: 'cloud',
      title: 'Cloud & DevOps',
      description: 'Infraestrutura, Segurança, Automação',
      icon: '☁️',
      color: 'var(--primary-green)'
    },
    {
      id: 'business',
      title: 'Negócios & Produto',
      description: 'Product Management, UX/UI, Estratégia',
      icon: '🚀',
      color: 'var(--primary-orange)'
    }
  ];

  const techOptions = [
    {
      id: 'ai-ml',
      title: 'Inteligência Artificial',
      description: 'Machine Learning, Deep Learning, NLP',
      icon: '🤖',
      color: 'var(--primary-purple)'
    },
    {
      id: 'blockchain',
      title: 'Blockchain & Web3',
      description: 'DeFi, NFTs, Metaverso',
      icon: '⛓️',
      color: 'var(--primary-blue)'
    },
    {
      id: 'iot',
      title: 'IoT & Hardware',
      description: 'Dispositivos conectados, Smart Cities',
      icon: '🏠',
      color: 'var(--primary-green)'
    },
    {
      id: 'cybersecurity',
      title: 'Cibersegurança',
      description: 'Proteção de dados, Compliance',
      icon: '🔒',
      color: 'var(--primary-orange)'
    }
  ];

  const futureOptions = [
    {
      id: 'remote',
      title: 'Trabalho Remoto',
      description: 'Flexibilidade e produtividade',
      icon: '🏠',
      color: 'var(--primary-blue)'
    },
    {
      id: 'sustainability',
      title: 'Tecnologia Verde',
      description: 'Sustentabilidade e impacto social',
      icon: '🌱',
      color: 'var(--primary-green)'
    },
    {
      id: 'collaboration',
      title: 'Colaboração Global',
      description: 'Equipes distribuídas e diversidade',
      icon: '🌍',
      color: 'var(--primary-purple)'
    },
    {
      id: 'innovation',
      title: 'Inovação Disruptiva',
      description: 'Startups e mudanças de paradigma',
      icon: '💡',
      color: 'var(--primary-orange)'
    }
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSelection = (type: string, value: string) => {
    switch (type) {
      case 'career':
        setCareerFocus(value);
        break;
      case 'tech':
        setTechInterest(value);
        break;
      case 'future':
        setFutureVision(value);
        break;
    }
  };

  const compressImage = async (base64Image: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const scale = Math.min(512 / img.width, 512 / img.height);
          const x = (512 - img.width * scale) / 2;
          const y = (512 - img.height * scale) / 2;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          const compressedBase64 = canvas.toDataURL('image/png', 0.7);
          resolve(compressedBase64);
        }
      };
      img.src = base64Image;
    });
  };

  const flipImageHorizontally = async (base64Image: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, 512, 512);
          resolve(canvas.toDataURL('image/png', 0.7));
        }
      };
      img.src = base64Image;
    });
  };

  const capture = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
    }
  }, [webcamRef]);

  const generateAvatar = useCallback(async () => {
    if (!imgSrc) return;
    
    setIsProcessing(true);
    setError(null);
    setProgress(5);
    setLoadingMessage('Preparando imagem...');
    let tick: any = null;
    try {
      setLoadingMessage('Comprimindo imagem...');
      const compressedImage = await compressImage(imgSrc);
      setProgress(20);
      setLoadingMessage('Ajustando selfie...');
      const flippedImageSrc = await flipImageHorizontally(compressedImage);
      setProgress(35);
      
      // Prompt profissional baseado nas seleções (mais específico e contextual)
      const finalPrompt = buildAvatarPrompt(careerFocus, techInterest, futureVision);

      setProgress(45);
      setLoadingMessage('Enviando para a IA...');
      // Progresso incremental enquanto aguarda o servidor
      tick = setInterval(() => {
        setProgress((p) => Math.min(p + 4, 90));
      }, 600);

      const response = await fetch('/api/generate-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl: flippedImageSrc, prompt: finalPrompt })
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || 'Falha na geração do avatar');
      }

      setLoadingMessage('Finalizando imagem...');
      setProgress(96);
      const data = await response.json();
      if (data?.imageUrl) {
        setProcessedImage(data.imageUrl);
        setProgress(100);
        setLoadingMessage('Concluído!');
      } else {
        throw new Error('Resposta inválida da API');
      }
    } catch (error: any) {
      console.error('Error processing image:', error);
      setError('Erro ao gerar avatar. Verifique a chave da API no servidor e tente novamente.');
    } finally {
      if (tick) clearInterval(tick);
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
        setLoadingMessage('');
      }, 400);
    }
  }, [imgSrc, careerFocus, techInterest, futureVision]);

  const retake = useCallback(() => {
    setImgSrc(null);
    setProcessedImage(null);
    setError(null);
  }, []);

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div className="modern-card" style={{ padding: '32px'}}>
            <Typography variant="h5" gutterBottom sx={{ 
              textAlign: 'center', 
              mb: 4,
              fontWeight: 700,
              color: 'var(--foreground)'
            }}>
              🎯 Qual é o seu foco principal de carreira?
            </Typography>
            <div className="selection-grid">
              {careerOptions.map((option) => (
                <div 
                  key={option.id}
                  className={`selection-card ${careerFocus === option.id ? 'selected' : ''}`}
                  onClick={() => handleSelection('career', option.id)}
                >
                  <div className="selection-card-icon">{option.icon}</div>
                  <div className="selection-card-title">{option.title}</div>
                  <div className="selection-card-description">{option.description}</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="modern-card" style={{ padding: '32px',  }}>
            <Typography variant="h5" gutterBottom sx={{ 
              textAlign: 'center', 
              mb: 4,
              fontWeight: 700,
              color: 'var(--foreground)'
            }}>
              🚀 Qual tecnologia mais te interessa?
            </Typography>
            <div className="selection-grid">
              {techOptions.map((option) => (
                <div 
                  key={option.id}
                  className={`selection-card ${techInterest === option.id ? 'selected' : ''}`}
                  onClick={() => handleSelection('tech', option.id)}
                >
                  <div className="selection-card-icon">{option.icon}</div>
                  <div className="selection-card-title">{option.title}</div>
                  <div className="selection-card-description">{option.description}</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="modern-card" style={{ padding: '32px', marginBottom: '' }}>
            <Typography variant="h5" gutterBottom sx={{ 
              textAlign: 'center', 
              mb: 4,
              fontWeight: 700,
              color: 'var(--foreground)'
            }}>
              🔮 Como você vê o futuro do trabalho?
            </Typography>
            <div className="selection-grid">
              {futureOptions.map((option) => (
                <div 
                  key={option.id}
                  className={`selection-card ${futureVision === option.id ? 'selected' : ''}`}
                  onClick={() => handleSelection('future', option.id)}
                >
                  <div className="selection-card-icon">{option.icon}</div>
                  <div className="selection-card-title">{option.title}</div>
                  <div className="selection-card-description">{option.description}</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="modern-card" style={{ padding: '42px', marginBottom: '32px' }}>
            <Typography variant="h5" gutterBottom sx={{ 
              textAlign: 'center', 
              mb: 4,
              fontWeight: 700,
              color: 'var(--foreground)'
            }}>
              📸 Capture sua foto para o avatar
            </Typography>
            
            <Box sx={{ 
              width: '100%',
              maxWidth: 500,
              height: 500,
              position: 'relative',
              border: '3px solid var(--primary-blue)',
              borderRadius: 'var(--border-radius)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow)',
              backgroundColor: 'var(--card-bg)',
              mx: 'auto',
              mb: 3
            }}>
              {processedImage ? (
                <img 
                  src={processedImage} 
                  alt="Generated Avatar" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : !imgSrc ? (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/png"
                  videoConstraints={{
                    width: 400,
                    height: 400,
                    facingMode: "user"
                  }}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transform: 'scaleX(-1)'
                  }}
                />
              ) : (
                <img 
                  src={imgSrc} 
                  alt="Captured" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transform: 'scaleX(-1)'
                  }} 
                />
              )}
            </Box>
            
            <Stack direction="column" spacing={2} sx={{ width: '100%' }}>
              {!imgSrc ? (
                <Button
                  variant="contained"
                  onClick={capture}
                  size="large"
                  className="modern-button btn-primary"
                  sx={{ width: '100%', fontSize: '1.6rem', fontWeight: 800, textTransform: 'none', borderRadius: '9999px', paddingY: '18px' }}
                  startIcon={<CameraAlt />}
                >
                  📸 Capturar Foto
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    onClick={retake}
                    disabled={isProcessing}
                    size="large"
                    className="modern-button"
                    sx={{
                      borderColor: 'var(--primary-blue)',
                      color: 'var(--primary-blue)',
                      borderWidth: '2px',
                      width: '100%',
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      textTransform: 'none',
                      borderRadius: '9999px',
                      paddingY: '18px'
                    }}
                    startIcon={<Refresh />}
                  >
                    🔄 Tirar Outra
                  </Button>
                  {!processedImage && (
                    <Button
                      variant="contained"
                      onClick={generateAvatar}
                      disabled={isProcessing}
                      size="large"
                      className="modern-button btn-success"
                      startIcon={isProcessing ? <CircularProgress size={24} color="inherit" /> : <Send />}
                      sx={{ width: '100%', fontSize: '1.6rem', fontWeight: 800, textTransform: 'none', borderRadius: '9999px', paddingY: '18px' }}
                    >
                      {isProcessing ? '🔄 Gerando Avatar...' : '✨ Criar Avatar Profissional'}
                    </Button>
                  )}
                </>
              )}
            </Stack>
          </div>
        );
      case 4:
        return (
          <div className="modern-card" style={{ padding: '32px', marginBottom: '32px' }}>
            <Typography variant="h5" gutterBottom sx={{ 
              textAlign: 'center', 
              mb: 4,
              fontWeight: 700,
              color: 'var(--foreground)'
            }}>
              📝 Seus dados de contato
            </Typography>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              <TextField
                fullWidth
                label="Nome completo"
                value={contactData.name}
                onChange={(e) => setContactData({...contactData, name: e.target.value})}
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email profissional"
                value={contactData.email}
                onChange={(e) => setContactData({...contactData, email: e.target.value})}
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Telefone"
                value={contactData.phone}
                onChange={(e) => setContactData({...contactData, phone: e.target.value})}
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Empresa"
                value={contactData.company}
                onChange={(e) => setContactData({...contactData, company: e.target.value})}
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </div>

            <Typography variant="body1" sx={{ textAlign: 'center', opacity: 0.8 }}>
              Obrigado! Revise seus dados e finalize com o botão Próximo.
            </Typography>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fair-container">
      <Stack spacing={4} alignItems="center" sx={{ py: 2 }}>
        {error && (
          <Alert severity="error" sx={{ 
            width: '100%', 
            borderRadius: 'var(--border-radius)',
            fontSize: '16px'
          }}>
            {error}
          </Alert>
        )}

        {isProcessing && (
          <div className="loading-overlay">
            <div className="loading-card">
              <div style={{ marginBottom: 16 }}>
                <CircularProgress size={56} thickness={4} />
              </div>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, textAlign: 'center' }}>
                Gerando seu avatar...
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, mb: 2, textAlign: 'center' }}>
                {loadingMessage || 'Aguarde alguns instantes'}
              </Typography>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, opacity: 0.7 }}>
                {progress}%
              </Typography>
            </div>
          </div>
        )}

        {/* Stepper */}
        <div className="modern-card" style={{ width: '100%', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {steps.map((label, index) => (
              <div key={label} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                flex: 1
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: index <= activeStep ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : '#e5e7eb',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}>
                  {index + 1}
                </div>
                <Typography variant="caption" sx={{ 
                  fontSize: '12px',
                  fontWeight: 600,
                  color: index <= activeStep ? '#ef4444' : '#6b7280',
                  textAlign: 'center'
                }}>
                  {label}
                </Typography>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent(activeStep)}

        {/* Navigation Buttons */}
        <Stack direction="row" spacing={2} sx={{ mb: 2, width: '100%' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            className="modern-button nav-button nav-button-outline"
            sx={{
              borderColor: 'var(--primary-blue)',
              color: 'var(--primary-blue)',
              borderWidth: '2.5px',
              borderRadius: '9999px',
              paddingY: '22px',
              minHeight: '72px',
              flex: 1,
              fontSize: '1.8rem',
              fontWeight: 800,
              textTransform: 'none',
              letterSpacing: '0.02em',
              '&:disabled': {
                borderColor: '#ccc',
                color: '#ccc'
              }
            }}
          >
            <i className="fa-solid fa-arrow-left"></i>
            Anterior
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={activeStep === steps.length - 1}
            className="modern-button nav-button nav-button-primary"
            sx={{
              borderRadius: '9999px',
              paddingY: '22px',
              minHeight: '72px',
              flex: 1,
              fontSize: '1.8rem',
              fontWeight: 800,
              textTransform: 'none',
              letterSpacing: '0.02em',
              color: '#fff',
              '&:disabled': {
                backgroundColor: '#ccc'
              }
            }}
          >
            Próximo
            <i className="fa-solid fa-arrow-right"></i>
          </Button>
        </Stack>
      </Stack>
    </div>
  );
};

export default WebcamCapture; 