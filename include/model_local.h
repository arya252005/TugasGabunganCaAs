#pragma once
#include <cstdarg>
namespace Eloquent {
    namespace ML {
        namespace Port {
            class RandomForest {
                public:
                    /**
                    * Predict class for features vector
                    */
                    int predict(float *x) {
                        uint8_t votes[2] = { 0 };
                        // tree #1
                        if (x[0] <= 34.91559600830078) {
                            if (x[1] <= 44.558860778808594) {
                                if (x[2] <= 479.7617645263672) {
                                    votes[0] += 1;
                                }

                                else {
                                    votes[1] += 1;
                                }
                            }

                            else {
                                if (x[2] <= 996.8211364746094) {
                                    votes[0] += 1;
                                }

                                else {
                                    votes[1] += 1;
                                }
                            }
                        }

                        else {
                            if (x[2] <= 493.4153289794922) {
                                if (x[0] <= 41.49762153625488) {
                                    votes[0] += 1;
                                }

                                else {
                                    if (x[0] <= 42.822662353515625) {
                                        votes[1] += 1;
                                    }

                                    else {
                                        if (x[0] <= 44.1190299987793) {
                                            votes[0] += 1;
                                        }

                                        else {
                                            votes[1] += 1;
                                        }
                                    }
                                }
                            }

                            else {
                                if (x[2] <= 509.92762756347656) {
                                    if (x[1] <= 50.934669494628906) {
                                        votes[1] += 1;
                                    }

                                    else {
                                        votes[0] += 1;
                                    }
                                }

                                else {
                                    if (x[1] <= 62.90889549255371) {
                                        votes[1] += 1;
                                    }

                                    else {
                                        votes[0] += 1;
                                    }
                                }
                            }
                        }

                        // tree #2
                        if (x[2] <= 528.7663879394531) {
                            if (x[2] <= 489.25660705566406) {
                                if (x[2] <= 470.6825256347656) {
                                    if (x[2] <= 460.53407287597656) {
                                        votes[0] += 1;
                                    }

                                    else {
                                        if (x[1] <= 34.13340377807617) {
                                            votes[1] += 1;
                                        }

                                        else {
                                            votes[0] += 1;
                                        }
                                    }
                                }

                                else {
                                    if (x[0] <= 38.243600845336914) {
                                        if (x[2] <= 486.7706756591797) {
                                            votes[0] += 1;
                                        }

                                        else {
                                            votes[0] += 1;
                                        }
                                    }

                                    else {
                                        votes[1] += 1;
                                    }
                                }
                            }

                            else {
                                if (x[2] <= 512.1795043945312) {
                                    if (x[2] <= 489.48753356933594) {
                                        if (x[1] <= 43.179168701171875) {
                                            votes[1] += 1;
                                        }

                                        else {
                                            votes[0] += 1;
                                        }
                                    }

                                    else {
                                        if (x[0] <= 38.782310485839844) {
                                            votes[0] += 1;
                                        }

                                        else {
                                            votes[1] += 1;
                                        }
                                    }
                                }

                                else {
                                    if (x[0] <= 35.9860725402832) {
                                        votes[0] += 1;
                                    }

                                    else {
                                        votes[1] += 1;
                                    }
                                }
                            }
                        }

                        else {
                            if (x[0] <= 30.370216369628906) {
                                votes[0] += 1;
                            }

                            else {
                                if (x[0] <= 33.51441764831543) {
                                    if (x[1] <= 69.07303237915039) {
                                        votes[1] += 1;
                                    }

                                    else {
                                        votes[0] += 1;
                                    }
                                }

                                else {
                                    if (x[0] <= 34.86646270751953) {
                                        if (x[0] <= 34.85978889465332) {
                                            votes[1] += 1;
                                        }

                                        else {
                                            votes[0] += 1;
                                        }
                                    }

                                    else {
                                        votes[1] += 1;
                                    }
                                }
                            }
                        }

                        // return argmax of votes
                        uint8_t classIdx = 0;
                        float maxVotes = votes[0];

                        for (uint8_t i = 1; i < 2; i++) {
                            if (votes[i] > maxVotes) {
                                classIdx = i;
                                maxVotes = votes[i];
                            }
                        }

                        return classIdx;
                    }

                protected:
                };
            }
        }
    }