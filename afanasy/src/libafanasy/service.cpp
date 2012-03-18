#include "service.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "../include/afanasy.h"
#include "../include/afpynames.h"

#include "../libafanasy/environment.h"

using namespace af;

#define AFOUTPUT
#undef AFOUTPUT
#include "../include/macrooutput.h"

Service::Service( const std::string & Type,
            const std::string & WDir,
            const std::string & Command,
            const std::string & Files,
            int CapKoeff,
            const std::list<std::string> & Hosts
):
   name( Type),
   wdir( WDir),
   command( Command),
   capkoeff( CapKoeff),
   hosts( Hosts),
   files( Files)
{
   initialize();
}

Service::Service( const TaskExec & taskexec):
   name( taskexec.getServiceType()),
   wdir( taskexec.getWDir()),
   command( taskexec.getCommand()),
   capkoeff( taskexec.getCapCoeff()),
   hosts( taskexec.getMultiHostsNames()),
   files( taskexec.getFiles())
{
   initialize();
}

void Service::initialize()
{
   PyObj_FuncGetWDir = NULL;
   PyObj_FuncGetCommand = NULL;
   PyObj_FuncGetFiles = NULL;
   PyObj_FuncCheckFiles = NULL;
   initialized = false;

   PyObject * pHostsList = PyList_New(0);
   for( std::list<std::string>::const_iterator it = hosts.begin(); it != hosts.end(); it++)
      if( PyList_Append( pHostsList, PyBytes_FromString((*it).c_str())) != 0)
      {
         AFERROR("Service::Service: PyList_Append:")
         PyErr_Print();
      }

   PyObject *pArgs;
   pArgs = PyTuple_New( 6);
   PyTuple_SetItem( pArgs, 0, PyBytes_FromString( af::Environment::getAfRoot().c_str()));
   PyTuple_SetItem( pArgs, 1, PyBytes_FromString( wdir.c_str()));
   PyTuple_SetItem( pArgs, 2, PyBytes_FromString( command.c_str()));
   PyTuple_SetItem( pArgs, 3, PyLong_FromLong( capkoeff));
   PyTuple_SetItem( pArgs, 4, pHostsList );
   PyTuple_SetItem( pArgs, 5, PyBytes_FromString( files.c_str()));

   // Try to import service class
   if( false == PyClass::init( AFPYNAMES::SERVICE_CLASSESDIR, name, pArgs))
      // If failed and imported class was not the base class
      if( name != AFPYNAMES::SERVICE_CLASSESBASE)
         // Try to import base service
         if( false == PyClass::init( AFPYNAMES::SERVICE_CLASSESDIR, AFPYNAMES::SERVICE_CLASSESBASE, pArgs))
            return;

   //Get functions:
   PyObj_FuncGetWDir= getFunction( AFPYNAMES::SERVICE_FUNC_GETWDIR);
   if( PyObj_FuncGetWDir == NULL ) return;
   PyObj_FuncGetCommand = getFunction( AFPYNAMES::SERVICE_FUNC_GETCOMMAND);
   if( PyObj_FuncGetCommand == NULL ) return;
   PyObj_FuncGetFiles = getFunction( AFPYNAMES::SERVICE_FUNC_GETFILES);
   if( PyObj_FuncGetFiles == NULL ) return;
   PyObj_FuncCheckFiles = getFunction( AFPYNAMES::SERVICE_FUNC_CHECKFILES);
   if( PyObj_FuncCheckFiles == NULL ) return;

   PyObject * pResult;

   // Process working directory:
   AFINFA("Service::initialize: Processing working dirctory:\n%s", wdir.c_str())
   pResult = PyObject_CallObject( PyObj_FuncGetWDir, NULL);
   if( pResult == NULL)
   {
      if( PyErr_Occurred()) PyErr_Print();
      return;
   }
   if( false == af::PyGetString( pResult, wdir))
   {
      AFERROR("Service:FuncGetWDir: Returned object is not a string.")
      Py_DECREF( pResult);
      return;
   }
   Py_DECREF( pResult);
   AFINFA("Service::initialize: Working dirctory:\n%s", wdir.c_str())

   // Process command:
   AFINFA("Service::initialize: Processing command:\n%s", command.c_str())
   pResult = PyObject_CallObject( PyObj_FuncGetCommand, NULL);
   if( pResult == NULL)
   {
      if( PyErr_Occurred()) PyErr_Print();
      return;
   }
   if( false == af::PyGetString( pResult, command))
   {
      AFERROR("Service:FuncGetCommand: Returned object is not a string.")
      Py_DECREF( pResult);
      return;
   }
   Py_DECREF( pResult);
   AFINFA("Service::initialize: Command:\n%s", command.c_str())

   // Process files:
   AFINFA("Service::initialize: Processing files:\n%s", files.c_str())
   pResult = PyObject_CallObject( PyObj_FuncGetFiles, NULL);
   if( pResult == NULL)
   {
      if( PyErr_Occurred()) PyErr_Print();
      return;
   }
   if( false == af::PyGetString( pResult, files))
   {
      AFERROR("Service:FuncGetCommand: Returned object is not a string.")
      Py_DECREF( pResult);
      return;
   }
   Py_DECREF( pResult);
   AFINFA("Service::initialize: Files:\n%s", files.c_str())

   initialized = true;
}

Service::~Service()
{
}

bool Service::checkFiles( int sizemin, int sizemax)
{
   return true;
}