FROM node:8.0.0                                       
                                                      
WORKDIR /usr/src                                      
                                                      
COPY . .                                              
                                                      
RUN npm install --build-from-source                   
                                                      
RUN npm run build                                     
                                                      
VOLUME [ "/usr/src/dist/files" ]                      
                                                      
EXPOSE 3000                                           
                                                      
CMD ["npm", "start"]                                  