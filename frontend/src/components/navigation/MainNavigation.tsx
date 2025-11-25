import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WalletConnector } from '@/components/blockchain/WalletConnector';
import {
  Users,
  Video,
  TrendingUp,
  Shield,
  Crown,
  Zap,
  ArrowRight,
  Globe,
  Lock,
  Mic,
  Rocket,
  Sparkles,
  Star,
  ChevronRight,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export interface MainNavigationProps {
  userStake?: number;
  isConnected?: boolean;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({ userStake = 0, isConnected = false }) => {
  const navigate = useNavigate();

  const getUserTier = (stake: number) => {
    if (stake >= 2000) return { name: "Multi-Stream Host", icon: <Crown className="h-4 w-4" />, color: "text-yellow-600" };
    if (stake >= 500) return { name: "Solo Streamer", icon: <Zap className="h-4 w-4" />, color: "text-purple-600" };
    if (stake >= 100) return { name: "Podcast Host", icon: <TrendingUp className="h-4 w-4" />, color: "text-blue-600" };
    return { name: "Basic User", icon: <Users className="h-4 w-4" />, color: "text-gray-600" };
  };

  const userTier = getUserTier(userStake);

  const navigationItems = [
    {
      title: "Private Meetings",
      description: "Secure, invite-only video meetings for teams and private discussions",
      icon: <Lock className="h-8 w-8" />,
      features: ["No staking required", "End-to-end encrypted", "Perfect for teams", "Screen sharing"],
      buttonText: "Create Meeting",
      buttonAction: () => navigate('/private-meetings'),
      gradient: "from-blue-500 to-blue-600",
      available: true,
      category: "meeting"
    },
    {
      title: "Public Streaming",
      description: "Broadcast to the world and earn from your content through tips and microtransactions",
      icon: <Globe className="h-8 w-8" />,
      features: [
        `Requires ${userStake >= 100 ? "✓" : "100 tokens stake"}`,
        `${userStake >= 100 ? userTier.name : "Podcast Host"} tier`,
        "Monetization enabled",
        "Public discovery"
      ],
      buttonText: userStake >= 100 ? "Start Streaming" : "Stake to Unlock",
      buttonAction: () => userStake >= 100 ? navigate('/public-streaming') : navigate('/staking'),
      gradient: userStake >= 100 ? "from-purple-500 to-purple-600" : "from-gray-400 to-gray-500",
      available: userStake >= 100,
      category: "streaming"
    },
    {
      title: "Staking Portal",
      description: "Stake tokens to unlock premium features and maximize your revenue share",
      icon: <TrendingUp className="h-8 w-8" />,
      features: [
        `${userTier.name} (${userStake.toLocaleString()} tokens)`,
        `${userStake >= 100 ? (userStake >= 500 ? (userStake >= 2000 ? 97 : 85) : 70) : 0}% revenue share`,
        "Tier progression",
        "Exclusive benefits"
      ],
      buttonText: "Manage Staking",
      buttonAction: () => navigate('/staking'),
      gradient: "from-green-500 to-green-600",
      available: true,
      category: "staking"
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.25, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Header with User Status */}
      <motion.div
        className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center lg:text-left flex-1">
          <motion.div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-60"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <Sparkles className="relative w-10 h-10 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-2" />
            </div>
            <h1 className="text-7xl lg:text-8xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Chillie
            </h1>
          </motion.div>
          <motion.p
            className="text-xl lg:text-2xl text-muted-foreground mb-6 max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Decentralized video meetings
            </span>{" "}
            and{" "}
            <span className="font-semibold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              streaming
            </span>{" "}
            on the Linera blockchain
          </motion.p>
        </div>

        <motion.div
          className="flex flex-col items-center lg:items-end gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <WalletConnector />
          {isConnected && (
            <motion.div
              className="text-center lg:text-right bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 text-sm mb-2">
                <span className="text-muted-foreground">Status:</span>
                <div className={`flex items-center gap-1 ${userTier.color}`}>
                  <Activity className="w-4 h-4" />
                  <span className="font-medium">{userTier.name}</span>
                </div>
              </div>
              {userStake > 0 && (
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {userStake.toLocaleString()} tokens staked
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Navigation Cards */}
      <motion.div
        className="grid lg:grid-cols-3 gap-6 mb-12"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {navigationItems.map((item, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className={`relative overflow-hidden group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 ${item.available ? 'hover:shadow-primary/25' : ''
              }`}>
              {/* Animated Gradient Background */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.15 }}
              />

              {/* Corner Decoration */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.gradient} opacity-10 rounded-bl-full`} />

              <CardContent className="p-8 relative">
                {/* Icon and Title */}
                <div className="flex items-start gap-4 mb-6">
                  <motion.div
                    className={`p-4 rounded-2xl bg-gradient-to-r ${item.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {item.icon}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                    {item.category === 'streaming' && (
                      <Badge
                        variant={item.available ? "default" : "secondary"}
                        className={`${item.available
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                          }`}
                      >
                        {item.available ? "✨ Available" : "🔒 Requires Staking"}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                  {item.description}
                </p>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  {item.features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center gap-3 text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                    >
                      <motion.div
                        className={`w-2 h-2 rounded-full ${feature.startsWith('✓') ? 'bg-green-500 shadow-green-500/50 shadow-lg' :
                            feature.includes('tokens') && userStake >= 100 ? 'bg-green-500 shadow-green-500/50 shadow-lg' :
                              'bg-muted'
                          }`}
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: idx * 0.1
                        }}
                      />
                      <span className={`${feature.startsWith('✓') || (feature.includes('tokens') && userStake >= 100)
                          ? 'text-foreground font-medium'
                          : 'text-muted-foreground'
                        }`}>
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Action Button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={item.buttonAction}
                    className={`w-full h-14 text-lg font-semibold bg-gradient-to-r ${item.gradient} hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${!item.available && item.category !== 'streaming' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    disabled={!item.available && item.category !== 'streaming'}
                  >
                    {item.buttonText}
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </motion.div>

                {/* Additional Info for Streaming */}
                {item.category === 'streaming' && userStake < 100 && (
                  <motion.div
                    className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-sm text-orange-800 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      <strong>Stake 100 tokens</strong> to unlock public streaming and start earning!
                    </p>
                  </motion.div>
                )}

                {/* Revenue Share Display for Staking */}
                {item.category === 'staking' && userStake >= 100 && (
                  <motion.div
                    className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-sm text-green-800 flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      <strong>Current Revenue Share:</strong> {
                        userStake >= 2000 ? 97 :
                          userStake >= 500 ? 85 : 70
                      }% • Stake more to increase!
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.3
            }
          }
        }}
      >
        {[
          { icon: Shield, title: "Blockchain-Powered", desc: "Rooms on Linera blockchain" },
          { icon: Users, title: "Dual Architecture", desc: "Private & public streams" },
          { icon: TrendingUp, title: "Creator Economy", desc: "Up to 97% revenue share" },
          { icon: Video, title: "Bandwidth Optimized", desc: "Podcast & video streaming" }
        ].map((stat, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
          >
            <Card className="p-6 text-center border-0 shadow-lg hover:shadow-xl hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
              <motion.div
                className="w-12 h-12 mx-auto mb-4 text-primary bg-primary/10 rounded-xl flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <stat.icon className="w-6 h-6" />
              </motion.div>
              <h3 className="font-bold mb-2">{stat.title}</h3>
              <p className="text-sm text-muted-foreground">{stat.desc}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default MainNavigation;